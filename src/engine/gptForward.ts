/**
 * Tiny GPT forward pass in TypeScript.
 *
 * Architecture: vocab_size=65 (Shakespeare chars), n_embd=32, n_head=2,
 * n_layer=2, block_size=64. This matches the nanoGPT checkpoint exported
 * to public/model-weights.json.
 *
 * The math here uses exactly the same primitives the user built in Levels 1-8.
 */

export interface TinyGPTWeights {
  vocab_size: number;
  n_embd: number;
  n_head: number;
  n_layer: number;
  block_size: number;
  token_emb: number[][];   // [vocab_size, n_embd]
  pos_emb: number[][];     // [block_size, n_embd]
  blocks: Array<{
    ln1_w: number[];         // [n_embd]
    ln1_b: number[];         // [n_embd]
    // Multi-head attention weights (each head projected down)
    attn_wq: number[][][];   // [n_head, head_size, n_embd]
    attn_wk: number[][][];   // [n_head, head_size, n_embd]
    attn_wv: number[][][];   // [n_head, head_size, n_embd]
    attn_wo: number[][];     // [n_embd, n_embd]
    ln2_w: number[];         // [n_embd]
    ln2_b: number[];         // [n_embd]
    ffn_w1: number[][];      // [4*n_embd, n_embd]
    ffn_b1: number[];        // [4*n_embd]
    ffn_w2: number[][];      // [n_embd, 4*n_embd]
    ffn_b2: number[];        // [n_embd]
  }>;
  ln_f_w: number[];          // [n_embd]
  ln_f_b: number[];          // [n_embd]
  lm_head: number[][];       // [vocab_size, n_embd]
}

// ── Math helpers (same operations as Level chips) ────────────────────────────

function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function matVec(W: number[][], x: number[]): number[] {
  // W: [out, in], x: [in] → [out]
  return W.map(row => dot(row, x));
}

function addVecs(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i]);
}

function layerNorm(x: number[], w: number[], b: number[]): number[] {
  const n = x.length;
  const mean = x.reduce((a, v) => a + v, 0) / n;
  const centered = x.map(v => v - mean);
  const variance = centered.reduce((a, v) => a + v * v, 0) / n;
  const std = Math.sqrt(variance + 1e-5);
  return centered.map((v, i) => (v / std) * w[i] + b[i]);
}

function softmax(x: number[]): number[] {
  const maxVal = Math.max(...x);
  const exps = x.map(v => Math.exp(v - maxVal));
  const sum = exps.reduce((a, v) => a + v, 0);
  return exps.map(v => v / sum);
}

function relu(x: number[]): number[] {
  return x.map(v => Math.max(0, v));
}

// ── Self-attention (causal, single token output for last position) ────────────

function selfAttention(
  x: number[][],   // [T, n_embd]
  wq: number[][],  // [head_size, n_embd]
  wk: number[][],  // [head_size, n_embd]
  wv: number[][],  // [head_size, n_embd]
): number[] {
  const T = x.length;
  const headSize = wq.length;

  const qs = x.map(xi => matVec(wq, xi));  // [T, head_size]
  const ks = x.map(xi => matVec(wk, xi));  // [T, head_size]
  const vs = x.map(xi => matVec(wv, xi));  // [T, head_size]

  // Attention scores for the last position (we only need the last token's output)
  const q = qs[T - 1];
  const scale = 1 / Math.sqrt(headSize);
  const scores = ks.map(k => dot(q, k) * scale); // [T]

  // Causal mask: future positions → -inf (already masked since we only go up to T-1)
  const weights = softmax(scores); // [T]

  // Weighted sum of values
  const out = new Array(headSize).fill(0);
  for (let t = 0; t < T; t++) {
    for (let d = 0; d < headSize; d++) {
      out[d] += weights[t] * vs[t][d];
    }
  }
  return out;
}

// ── Transformer block ─────────────────────────────────────────────────────────

function transformerBlock(
  x: number[][],  // [T, n_embd]
  block: TinyGPTWeights['blocks'][0],
  nHead: number,
): number[][] {
  const T = x.length;
  const nEmbd = x[0].length;

  // Layer norm 1
  const xLn1 = x.map(xi => layerNorm(xi, block.ln1_w, block.ln1_b));

  // Multi-head attention
  const headOuts: number[][] = [];
  for (let h = 0; h < nHead; h++) {
    const wq = block.attn_wq[h];  // [head_size, n_embd]
    const wk = block.attn_wk[h];
    const wv = block.attn_wv[h];
    headOuts.push(selfAttention(xLn1, wq, wk, wv)); // [head_size]
  }

  // Concatenate heads → [n_embd] (last position only)
  const catHead = headOuts.flat();

  // Project out
  const attnOut = matVec(block.attn_wo, catHead); // [n_embd]

  // Add residual for last position
  const x2 = x.map((xi, t) => {
    if (t === T - 1) return addVecs(xi, attnOut);
    return addVecs(xi, new Array(nEmbd).fill(0)); // others unchanged
  });

  // Layer norm 2 (last position only for efficiency, but we do all for correctness)
  const xLn2 = x2.map(xi => layerNorm(xi, block.ln2_w, block.ln2_b));

  // FFN
  const x3 = x2.map((xi, t) => {
    const hidden = addVecs(matVec(block.ffn_w1, xLn2[t]), block.ffn_b1);
    const activated = relu(hidden);
    const ffnOut = addVecs(matVec(block.ffn_w2, activated), block.ffn_b2);
    return addVecs(xi, ffnOut);
  });

  return x3;
}

// ── Full forward pass ─────────────────────────────────────────────────────────

/**
 * Run a forward pass through the tiny GPT.
 * @param weights Loaded weights
 * @param tokens  Array of token indices (max block_size)
 * @returns Logits for next-token prediction [vocab_size]
 */
export function gptForward(weights: TinyGPTWeights, tokens: number[]): number[] {
  const T = Math.min(tokens.length, weights.block_size);
  const slice = tokens.slice(-T);

  // Token + positional embeddings
  let x: number[][] = slice.map((tok, pos) =>
    addVecs(weights.token_emb[tok], weights.pos_emb[pos])
  );

  // Transformer blocks
  for (const block of weights.blocks) {
    x = transformerBlock(x, block, weights.n_head);
  }

  // Final layer norm on last position
  const last = layerNorm(x[x.length - 1], weights.ln_f_w, weights.ln_f_b);

  // LM head: [vocab_size, n_embd] × [n_embd] → [vocab_size]
  return matVec(weights.lm_head, last);
}

/**
 * Get top-k next-token predictions.
 * @returns Array of { token, prob, char } sorted by probability descending
 */
export function topK(
  logits: number[],
  chars: string[],
  k = 5
): Array<{ token: number; prob: number; char: string }> {
  const probs = softmax(logits);
  return probs
    .map((prob, i) => ({ token: i, prob, char: chars[i] }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, k);
}
