import type { LevelDef } from '../engine/types';

export const LEVEL_DEFS: LevelDef[] = [

  // ── Level 1: Dot Product ───────────────────────────────────────────────────
  {
    id: 1,
    title: 'Dot Product',
    concept: 'multiply + sum',
    hook: 'Before attention exists, similarity must be measured.',
    unlockMessage: 'You have taught the machine to measure closeness.',
    color: '#f5c518',
    producesChip: 'dot_product',
    description:
      'Every transformer starts here. When a query asks "which tokens should I attend to?", ' +
      'it scores each key with a dot product — one number that says how similar two vectors are. ' +
      'Higher score = more attention. ' +
      '(1) Add MULTIPLY → connect a and b → element-wise products. ' +
      '(2) Add SUM → connect MULTIPLY output → sums all products into one scalar.',
    math: 'a · b = Σ (aᵢ × bᵢ)',
    gptCode:
`class Head(nn.Module):
  def forward(self, x):
      q = self.query(x)   # (B,T,head_size)
      k = self.key(x)     # (B,T,head_size)
      # ▶ dot product of every q with every k:
      wei = q @ k.transpose(-2,-1)  # (B,T,T)`,
    availablePrimitives: ['multiply', 'sum'],
    testCases: [
      { label: '[1,2,3] · [4,5,6]', inputs: { vec_a: [1, 2, 3], vec_b: [4, 5, 6] }, expected: 32 },
      { label: '[0,1,0] · [7,3,2]', inputs: { vec_a: [0, 1, 0], vec_b: [7, 3, 2] }, expected: 3 },
      { label: '[2,2,2] · [3,3,3]', inputs: { vec_a: [2, 2, 2], vec_b: [3, 3, 3] }, expected: 18 },
    ],
    initialNodes: [
      { id: 'vec_a', type: 'inputNode', position: { x: 60, y: 100 }, data: { label: 'a', fixedValue: [1, 2, 3] } },
      { id: 'vec_b', type: 'inputNode', position: { x: 60, y: 310 }, data: { label: 'b', fixedValue: [4, 5, 6] } },
      { id: 'output', type: 'outputNode', position: { x: 880, y: 195 }, data: { blockType: 'result', target: 32, computedValue: null } },
    ],
  },

  // ── Level 2: Softmax ───────────────────────────────────────────────────────
  {
    id: 2,
    title: 'Softmax',
    concept: 'exp ÷ sum(exp)',
    hook: 'Raw scores mean nothing. Probabilities mean everything.',
    unlockMessage: 'The machine now knows how to choose.',
    color: '#e07b39',
    producesChip: 'softmax_vec',
    description:
      'Raw attention scores are just numbers — they could be anything. ' +
      'Softmax converts them into probabilities that sum to 1, so the model can decide ' +
      '"spend 70% of attention here, 30% there." Without it, attention has no meaning. ' +
      '(1) Add EXP → connect x → eˣ per element. ' +
      '(2) Add SUM → connect EXP output → total. ' +
      '(3) Add DIVIDE → connect EXP output to vec, SUM to by → normalize.',
    math: 'softmax(xᵢ) = eˣⁱ / Σ eˣʲ',
    gptCode:
`class Head(nn.Module):
  def forward(self, x):
      ...
      # ▶ convert raw scores to attention weights:
      wei = F.softmax(wei, dim=-1)  # (B,T,T)`,
    availablePrimitives: ['exp', 'sum', 'divide'],
    testCases: [
      { label: 'softmax([2, 1, 0.1])', inputs: { scores: [2, 1, 0.1] }, expected: [0.659, 0.242, 0.099] },
      { label: 'softmax([1, 1, 1])',   inputs: { scores: [1, 1, 1] },   expected: [0.333, 0.333, 0.333] },
      { label: 'softmax([1, 2, 0.5])', inputs: { scores: [1, 2, 0.5] }, expected: [0.231, 0.628, 0.140] },
    ],
    initialNodes: [
      { id: 'scores', type: 'inputNode', position: { x: 60, y: 195 }, data: { label: 'x', fixedValue: [2, 1, 0.1] } },
      { id: 'output', type: 'outputNode', position: { x: 880, y: 195 }, data: { blockType: 'result', target: [0.659, 0.242, 0.099], computedValue: null } },
    ],
  },

  // ── Level 3: Scaled Score ──────────────────────────────────────────────────
  {
    id: 3,
    title: 'Scaled Score',
    concept: 'dot(q,k) / √d',
    hook: 'Raw attention is chaos. Scale it, and clarity emerges.',
    unlockMessage: 'You have tamed the explosion of similarity.',
    color: '#4cc9f0',
    producesChip: 'scaled_dot',
    description:
      'As vectors get longer, dot products grow larger — softmax then collapses to a one-hot spike ' +
      'and gradients vanish. GPT divides every score by √d to keep values in a stable range. ' +
      'This single division is what makes training on long sequences possible. ' +
      '(1) Add DOT PRODUCT chip → connect q and k → raw score. ' +
      '(2) Add SQRT → connect d input → √d. ' +
      '(3) Add DIVIDE → raw score to vec, √d to by → scaled output.',
    math: 'score = (q · k) / √d',
    gptCode:
`class Head(nn.Module):
  def forward(self, x):
      ...
      # ▶ dot product, then scale by dimension:
      wei = q @ k.transpose(-2,-1) * k.shape[-1]**-0.5`,
    availablePrimitives: ['sqrt_scalar', 'divide'],
    testCases: [
      { label: 'q=[1,2,0], k=[1,1,0], d=3', inputs: { q: [1, 2, 0], k: [1, 1, 0] }, expected: 1.732 },
      { label: 'q=[1,0,0], k=[1,0,0], d=3', inputs: { q: [1, 0, 0], k: [1, 0, 0] }, expected: 0.577 },
      { label: 'q=[2,1,0], k=[1,2,0], d=3', inputs: { q: [2, 1, 0], k: [1, 2, 0] }, expected: 2.309 },
    ],
    initialNodes: [
      { id: 'q', type: 'inputNode', position: { x: 60, y: 100 }, data: { label: 'q', fixedValue: [1, 2, 0] } },
      { id: 'k', type: 'inputNode', position: { x: 60, y: 280 }, data: { label: 'k', fixedValue: [1, 1, 0] } },
      { id: 'd', type: 'inputNode', position: { x: 60, y: 460 }, data: { label: 'd', fixedValue: 3 } },
      { id: 'output', type: 'outputNode', position: { x: 940, y: 280 }, data: { blockType: 'result', target: 1.732, computedValue: null } },
    ],
  },

  // ── Level 4: Attention Weights ─────────────────────────────────────────────
  {
    id: 4,
    title: 'Attention Weights',
    concept: 'softmax(scaled_dot(q, each k))',
    hook: 'Which words matter? Let the scores decide.',
    unlockMessage: 'The machine now knows where to look.',
    color: '#f72585',
    producesChip: 'attn_weights',
    description:
      'This is the "where to look" chip. The model has a query (what it\'s looking for) and two keys ' +
      '(candidate tokens). Scoring each key against the query — then softmax-ing — gives weights: ' +
      'how much attention to pay to each token. Every attention head in GPT does exactly this. ' +
      '(1) Add SCALED DOT chip → connect q + k0 → score s0. ' +
      '(2) Add another SCALED DOT chip → connect q + k1 → score s1. ' +
      '(3) Add PACK → connect s0 and s1 → [s0, s1]. ' +
      '(4) Add SOFTMAX chip → connect [s0, s1] → weights [w0, w1].',
    math: 'w = softmax([q·k₀/√d, q·k₁/√d])',
    gptCode:
`class Head(nn.Module):
  def forward(self, x):
      q = self.query(x)
      k = self.key(x)
      # ▶ compute all attention weights at once:
      wei = F.softmax(
          q @ k.transpose(-2,-1) * k.shape[-1]**-0.5,
          dim=-1
      )  # (B,T,T)`,
    availablePrimitives: ['pack2'],
    testCases: [
      { label: 'q=[1,2,0], k0=[1,1,0], k1=[0,1,1]', inputs: { q: [1, 2, 0], k0: [1, 1, 0], k1: [0, 1, 1] }, expected: [0.640, 0.360] },
      { label: 'q=[2,0,0], k0=[1,0,0], k1=[0,0,1]', inputs: { q: [2, 0, 0], k0: [1, 0, 0], k1: [0, 0, 1] }, expected: [0.760, 0.240] },
      { label: 'q=[1,1,1], k0=[1,0,0], k1=[0,1,0]', inputs: { q: [1, 1, 1], k0: [1, 0, 0], k1: [0, 1, 0] }, expected: [0.500, 0.500] },
    ],
    initialNodes: [
      { id: 'q',  type: 'inputNode', position: { x: 60, y: 80  }, data: { label: 'q',  fixedValue: [1, 2, 0] } },
      { id: 'k0', type: 'inputNode', position: { x: 60, y: 240 }, data: { label: 'k0', fixedValue: [1, 1, 0] } },
      { id: 'k1', type: 'inputNode', position: { x: 60, y: 400 }, data: { label: 'k1', fixedValue: [0, 1, 1] } },
      { id: 'output', type: 'outputNode', position: { x: 940, y: 240 }, data: { blockType: 'result', target: [0.640, 0.360], computedValue: null } },
    ],
  },

  // ── Level 5: Attention Head ────────────────────────────────────────────────
  {
    id: 5,
    title: 'Attention Head',
    concept: 'Σ wᵢ × vᵢ',
    hook: 'Attention is not just looking — it is combining.',
    unlockMessage: 'The machine now blends meaning by importance.',
    color: '#7209b7',
    producesChip: 'attn_head',
    description:
      'Knowing where to look is only half — now the model must actually retrieve information. ' +
      'Values are the content vectors. The attention head blends them by weight: ' +
      'if token A got 80% attention, its value contributes 80% to the output. ' +
      'This weighted sum is what flows into the rest of the transformer. ' +
      '(1) Add ATTN WEIGHTS chip → connect q, k0, k1 → [w0, w1]. ' +
      '(2) Add VEC[0] → wire from ATTN WEIGHTS → w0. ' +
      '(3) Add VEC[1] → wire from ATTN WEIGHTS → w1. ' +
      '(4) Add SCALE VEC → w0 + v0 → w0·v0. ' +
      '(5) Add SCALE VEC → w1 + v1 → w1·v1. ' +
      '(6) Add ADD → both scaled vectors → output. ' +
      'Tip: one output can connect to multiple inputs.',
    math: 'out = w₀·v₀ + w₁·v₁',
    gptCode:
`class Head(nn.Module):
  def forward(self, x):
      ...
      v = self.value(x)    # (B,T,head_size)
      # ▶ weighted sum of values:
      out = wei @ v        # (B,T,head_size)
      return out`,
    availablePrimitives: ['index0', 'index1', 'mul_scalar_vec', 'add_vecs'],
    testCases: [
      { label: 'w=[0.64,0.36], v0=[2,0], v1=[0,4]', inputs: { q: [1, 2, 0], k0: [1, 1, 0], k1: [0, 1, 1], v0: [2, 0], v1: [0, 4] }, expected: [1.280, 1.440] },
      { label: 'w=[0.5,0.5], v0=[1,2], v1=[3,4]',   inputs: { q: [1, 1, 1], k0: [1, 0, 0], k1: [0, 1, 0], v0: [1, 2], v1: [3, 4] }, expected: [2.0, 3.0] },
      { label: 'w=[0.76,0.24], v0=[4,0], v1=[0,4]', inputs: { q: [2, 0, 0], k0: [1, 0, 0], k1: [0, 0, 1], v0: [4, 0], v1: [0, 4] }, expected: [3.040, 0.960] },
    ],
    initialNodes: [
      { id: 'q',  type: 'inputNode', position: { x: 60, y: 60  }, data: { label: 'q',  fixedValue: [1, 2, 0] } },
      { id: 'k0', type: 'inputNode', position: { x: 60, y: 190 }, data: { label: 'k0', fixedValue: [1, 1, 0] } },
      { id: 'k1', type: 'inputNode', position: { x: 60, y: 320 }, data: { label: 'k1', fixedValue: [0, 1, 1] } },
      { id: 'v0', type: 'inputNode', position: { x: 60, y: 450 }, data: { label: 'v0', fixedValue: [2, 0] } },
      { id: 'v1', type: 'inputNode', position: { x: 60, y: 580 }, data: { label: 'v1', fixedValue: [0, 4] } },
      { id: 'output', type: 'outputNode', position: { x: 980, y: 320 }, data: { blockType: 'result', target: [1.280, 1.440], computedValue: null } },
    ],
  },

  // ── Level 6: ReLU Activation ───────────────────────────────────────────────
  {
    id: 6,
    title: 'ReLU Activation',
    concept: 'max(x, 0)',
    hook: 'Negativity serves no purpose. Cast it out.',
    unlockMessage: 'The machine has learned to ignore the void.',
    color: '#ff6b6b',
    producesChip: 'relu',
    description:
      'After the linear layer in the feed-forward block, the model needs non-linearity — ' +
      'without it, stacking layers does nothing a single layer couldn\'t do. ' +
      'ReLU is the simplest non-linearity: pass positives through, kill negatives. ' +
      'It\'s what gives the FFN block its expressive power. ' +
      '(1) Notice the zeros input already on canvas — same length as x. ' +
      '(2) Add MAX → connect x to port a, zeros to port b. ' +
      '(3) Wire MAX output → final output.',
    math: 'ReLU(x) = max(x, 0)',
    gptCode:
`class FeedFoward(nn.Module):
  def __init__(self, n_embd):
      self.net = nn.Sequential(
          nn.Linear(n_embd, 4 * n_embd),
          nn.ReLU(),    # ← this is the chip you assembled in Level 6
          nn.Linear(4 * n_embd, n_embd),
      )`,
    availablePrimitives: ['max_vec'],
    testCases: [
      { label: 'relu([1, -2, 3])',   inputs: { x: [1, -2, 3] },   expected: [1, 0, 3] },
      { label: 'relu([-1, -1, -1])', inputs: { x: [-1, -1, -1] }, expected: [0, 0, 0] },
      { label: 'relu([0, 5, -3])',   inputs: { x: [0, 5, -3] },   expected: [0, 5, 0] },
    ],
    initialNodes: [
      { id: 'x',     type: 'inputNode', position: { x: 60, y: 200 }, data: { label: 'x',     fixedValue: [1, -2, 3] } },
      { id: 'zeros', type: 'inputNode', position: { x: 60, y: 380 }, data: { label: 'zeros', fixedValue: [0, 0, 0] } },
      { id: 'output', type: 'outputNode', position: { x: 880, y: 290 }, data: { blockType: 'result', target: [1, 0, 3], computedValue: null } },
    ],
  },

  // ── Level 7: Feed-Forward ──────────────────────────────────────────────────
  {
    id: 7,
    title: 'Feed-Forward',
    concept: 'ReLU(W⊙x + b)',
    hook: 'Thinking happens in the space between attention.',
    unlockMessage: 'The thinking layer is complete.',
    color: '#ef476f',
    producesChip: 'ffn_relu',
    description:
      'Attention decides what to look at; the feed-forward block decides what to think about it. ' +
      'Every token position runs this independently: a linear transform (W⊙x + b) followed by ReLU. ' +
      'In GPT this is where most of the model\'s "knowledge" is stored — the FFN is 4× wider than the embedding. ' +
      '(1) Add MULTIPLY → connect x and W → W⊙x. ' +
      '(2) Add ADD → connect W⊙x and b → W⊙x + b. ' +
      '(3) Add ReLU chip → connect W⊙x + b → final output.',
    math: 'out = ReLU(W ⊙ x + b)',
    gptCode:
`class FeedFoward(nn.Module):
  def __init__(self, n_embd):
      self.net = nn.Sequential(
          nn.Linear(n_embd, 4 * n_embd),
          nn.ReLU(),
          nn.Linear(4 * n_embd, n_embd),
      )`,
    availablePrimitives: ['multiply', 'add_vecs'],
    testCases: [
      { label: 'ReLU(W⊙x + b) = [2,0,0]', inputs: { x: [1, 2, 3], W: [2, -1, 0.5], b: [0, 1, -2] }, expected: [2, 0, 0] },
      { label: 'ReLU(W⊙x + b) = [1,1,1]', inputs: { x: [1, 1, 1], W: [1,  1,   1], b: [0, 0,  0] }, expected: [1, 1, 1] },
      { label: 'ReLU(W⊙x + b) = [1,0,0]', inputs: { x: [2, 3, 1], W: [1, -1,   2], b: [-1, 0, -4] }, expected: [1, 0, 0] },
    ],
    initialNodes: [
      { id: 'x', type: 'inputNode', position: { x: 60, y: 100 }, data: { label: 'x', fixedValue: [1, 2, 3] } },
      { id: 'W', type: 'inputNode', position: { x: 60, y: 260 }, data: { label: 'W', fixedValue: [2, -1, 0.5] } },
      { id: 'b', type: 'inputNode', position: { x: 60, y: 420 }, data: { label: 'b', fixedValue: [0, 1, -2] } },
      { id: 'output', type: 'outputNode', position: { x: 900, y: 260 }, data: { blockType: 'result', target: [2, 0, 0], computedValue: null } },
    ],
  },

  // ── Level 8: Layer Norm ────────────────────────────────────────────────────
  {
    id: 8,
    title: 'Layer Norm',
    concept: '(x − μ) / σ',
    hook: 'Before attention speaks, the chaos must be stilled.',
    unlockMessage: 'You have brought order to the signal.',
    color: '#3a86ff',
    producesChip: 'layer_norm',
    description:
      'As activations flow through many layers they shift and grow — gradients explode or vanish. ' +
      'Layer norm re-centers every vector to mean=0, std=1 before each sub-layer. ' +
      'GPT applies it twice per block: once before attention, once before FFN. ' +
      'It\'s what makes training deep transformers stable. ' +
      '(1) Add MEAN → connect x → μ. ' +
      '(2) Add SUBTRACT → connect x and μ → (x−μ). ' +
      '(3) Add MULTIPLY → connect SUBTRACT output to both ports → (x−μ)². ' +
      '(4) Add MEAN → connect squared values → σ². ' +
      '(5) Add SQRT → connect σ² → σ. ' +
      '(6) Add DIVIDE → (x−μ) to vec, σ to by → normalized output.',
    math: 'out = (x − mean(x)) / std(x)',
    gptCode:
`# Applied once before attention, once before FFN:
x = nn.LayerNorm(n_embd)(x)
# → shifts mean to 0, standard deviation to 1`,
    availablePrimitives: ['mean_vec', 'sub_scalar', 'multiply', 'sqrt_scalar', 'divide'],
    testCases: [
      { label: 'norm([2, 4, 6])',  inputs: { x: [2, 4, 6] },  expected: [-1.225, 0.0, 1.225] },
      { label: 'norm([0, 1, 5])',  inputs: { x: [0, 1, 5] },  expected: [-0.926, -0.463, 1.389] },
      { label: 'norm([1, 2, 10])', inputs: { x: [1, 2, 10] }, expected: [-0.828, -0.579, 1.407] },
    ],
    initialNodes: [
      { id: 'x', type: 'inputNode', position: { x: 60, y: 260 }, data: { label: 'x', fixedValue: [2, 4, 6] } },
      { id: 'output', type: 'outputNode', position: { x: 1020, y: 260 }, data: { blockType: 'result', target: [-1.225, 0.0, 1.225], computedValue: null } },
    ],
  },

  // ── Level 9: Transformer Block (Capstone) ──────────────────────────────────
  {
    id: 9,
    title: 'Transformer Block',
    concept: 'x + attn(ln(x)) then + ffn(ln(·))',
    hook: 'The self that survives transformation — that is strength.',
    unlockMessage: 'THE TRANSFORMER HAS SPOKEN.',
    color: '#06d6a0',
    producesChip: 'transformer_block',
    description:
      'This is the full repeating unit of GPT — stack 6 of these and you have GPT-2 small. ' +
      'The residual connections (x + ...) are critical: they give gradients a direct highway back ' +
      'through the network, making it possible to train dozens of layers deep. ' +
      'You are wiring the exact structure from gpt.py\'s Block.forward(). ' +
      '(1) Add LAYER NORM chip → connect x → ln1. ' +
      '(2) Add ATTN HEAD chip → connect ln1, k0, k1, v0, v1 → attn_out. ' +
      '(3) Add ADD → x + attn_out → res1 (first residual). ' +
      '(4) Add LAYER NORM chip → connect res1 → ln2. ' +
      '(5) Add FFN chip → connect ln2, W, b → ffn_out. ' +
      '(6) Add ADD → res1 + ffn_out → final output (second residual).',
    math: 'x = x + attn(ln(x));  x = x + ffn(ln(x))',
    gptCode:
`class Block(nn.Module):
  def forward(self, x):
      # ▶ assemble the full block:
      x = x + self.sa(self.ln1(x))   # attention + residual
      x = x + self.ffwd(self.ln2(x)) # FFN + residual
      return x`,
    availablePrimitives: ['add_vecs'],
    testCases: [
      { label: 'x=[1,2]', inputs: { x: [1, 2] }, expected: [1.196, 3.804] },
      { label: 'x=[0,0]', inputs: { x: [0, 0] }, expected: [0.5, 0.5] },
      { label: 'x=[2,2]', inputs: { x: [2, 2] }, expected: [2.5, 2.5] },
    ],
    initialNodes: [
      { id: 'x',  type: 'inputNode', position: { x: 60, y: 300 }, data: { label: 'x',  fixedValue: [1, 2] } },
      { id: 'k0', type: 'inputNode', position: { x: 60, y: 60  }, data: { label: 'k0', fixedValue: [1, 0] } },
      { id: 'k1', type: 'inputNode', position: { x: 60, y: 160 }, data: { label: 'k1', fixedValue: [0, 1] } },
      { id: 'v0', type: 'inputNode', position: { x: 60, y: 440 }, data: { label: 'v0', fixedValue: [1, 0] } },
      { id: 'v1', type: 'inputNode', position: { x: 60, y: 540 }, data: { label: 'v1', fixedValue: [0, 1] } },
      { id: 'W',  type: 'inputNode', position: { x: 60, y: 640 }, data: { label: 'W',  fixedValue: [1, 1] } },
      { id: 'b',  type: 'inputNode', position: { x: 60, y: 740 }, data: { label: 'b',  fixedValue: [0, 0] } },
      { id: 'output', type: 'outputNode', position: { x: 1040, y: 400 }, data: { blockType: 'result', target: [1.196, 3.804], computedValue: null } },
    ],
  },
];
