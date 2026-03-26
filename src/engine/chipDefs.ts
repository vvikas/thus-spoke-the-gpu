import type { ChipDef } from './types';

const r = (n: number) => Math.round(n * 1000) / 1000;

// ── Shared math helpers ────────────────────────────────────────────────────
function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

function softmaxArr(x: number[]): number[] {
  const exps = x.map(Math.exp);
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => r(e / sum));
}

function scaledDotFn(q: number[], k: number[]): number {
  return r(dot(q, k) / Math.sqrt(q.length));
}

function layerNormFn(x: number[]): number[] {
  const mean = x.reduce((a, b) => a + b, 0) / x.length;
  const centered = x.map(xi => xi - mean);
  const variance = centered.reduce((a, b) => a + b * b, 0) / x.length;
  const std = Math.sqrt(variance);
  if (std < 1e-8) return centered.map(() => r(0));
  return centered.map(xi => r(xi / std));
}

// ── Chip definitions ────────────────────────────────────────────────────────
export const CHIP_DEFS: Record<string, ChipDef> = {

  dot_product: {
    id: 'dot_product',
    label: 'DOT PRODUCT',
    inputs: ['a', 'b'],
    description: 'Σ(aᵢ × bᵢ) — vector similarity',
    code: 'torch.dot(a, b)',
    color: '#f5c518',
    unlockedByLevel: 1,
    compute: ({ a, b }) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return null;
      if ((a as number[]).length !== (b as number[]).length) return null;
      return r(dot(a as number[], b as number[]));
    },
  },

  softmax_vec: {
    id: 'softmax_vec',
    label: 'SOFTMAX',
    inputs: ['x'],
    description: 'eˣ / Σeˣ → probabilities',
    code: 'F.softmax(x, dim=-1)',
    color: '#e07b39',
    unlockedByLevel: 2,
    compute: ({ x }) => {
      if (!Array.isArray(x)) return null;
      return softmaxArr(x as number[]);
    },
  },

  scaled_dot: {
    id: 'scaled_dot',
    label: 'SCALED DOT',
    inputs: ['q', 'k'],
    description: 'q·k / √d — scaled similarity',
    code: 'q @ k.T * d**-0.5',
    color: '#4cc9f0',
    unlockedByLevel: 3,
    compute: ({ q, k }) => {
      if (!Array.isArray(q) || !Array.isArray(k)) return null;
      if ((q as number[]).length !== (k as number[]).length) return null;
      return scaledDotFn(q as number[], k as number[]);
    },
  },

  attn_weights: {
    id: 'attn_weights',
    label: 'ATTN WEIGHTS',
    inputs: ['q', 'k0', 'k1'],
    description: 'softmax([scaled_dot(q,k0), scaled_dot(q,k1)])',
    code: 'F.softmax(q @ K.T * d**-0.5, dim=-1)',
    color: '#f72585',
    unlockedByLevel: 4,
    compute: ({ q, k0, k1 }) => {
      if (!Array.isArray(q) || !Array.isArray(k0) || !Array.isArray(k1)) return null;
      const s0 = scaledDotFn(q as number[], k0 as number[]);
      const s1 = scaledDotFn(q as number[], k1 as number[]);
      return softmaxArr([s0, s1]);
    },
  },

  attn_head: {
    id: 'attn_head',
    label: 'ATTN HEAD',
    inputs: ['q', 'k0', 'k1', 'v0', 'v1'],
    description: 'weighted sum of values by attention weights',
    code: 'out = wei @ v  # wei = softmax(q@k.T * d**-0.5)',
    color: '#7209b7',
    unlockedByLevel: 5,
    compute: ({ q, k0, k1, v0, v1 }) => {
      if (
        !Array.isArray(q) || !Array.isArray(k0) || !Array.isArray(k1) ||
        !Array.isArray(v0) || !Array.isArray(v1)
      ) return null;
      const [w0, w1] = softmaxArr([
        scaledDotFn(q as number[], k0 as number[]),
        scaledDotFn(q as number[], k1 as number[]),
      ]);
      return (v0 as number[]).map((vi, i) => r(w0 * vi + w1 * (v1 as number[])[i]));
    },
  },

  relu: {
    id: 'relu',
    label: 'ReLU',
    inputs: ['x'],
    description: 'max(x, 0) — zeros out negatives',
    code: 'F.relu(x)',
    color: '#ff6b6b',
    unlockedByLevel: 6,
    compute: ({ x }) => {
      if (!Array.isArray(x)) return null;
      return (x as number[]).map(v => Math.max(0, v));
    },
  },

  ffn_relu: {
    id: 'ffn_relu',
    label: 'FFN · ReLU',
    inputs: ['x', 'W', 'b'],
    description: 'ReLU(W⊙x + b) elementwise',
    code: 'F.relu(W * x + b)',
    color: '#ef476f',
    unlockedByLevel: 7,
    compute: ({ x, W, b }) => {
      if (!Array.isArray(x) || !Array.isArray(W) || !Array.isArray(b)) return null;
      return (x as number[]).map((xi, i) =>
        Math.max(0, r(r((W as number[])[i] * xi) + (b as number[])[i]))
      );
    },
  },

  layer_norm: {
    id: 'layer_norm',
    label: 'LAYER NORM',
    inputs: ['x'],
    description: '(x − μ) / σ — stabilises activations',
    code: 'nn.LayerNorm(n_embd)(x)',
    color: '#3a86ff',
    unlockedByLevel: 8,
    compute: ({ x }) => {
      if (!Array.isArray(x)) return null;
      return layerNormFn(x as number[]);
    },
  },

  transformer_block: {
    id: 'transformer_block',
    label: 'TRANSFORMER',
    inputs: ['x', 'k0', 'k1', 'v0', 'v1', 'W', 'b'],
    description: 'x + attn(ln(x)) then + ffn(ln(·))',
    code: 'x = x + sa(ln1(x)); x = x + ffwd(ln2(x))',
    color: '#06d6a0',
    unlockedByLevel: 9,
    compute: ({ x, k0, k1, v0, v1, W, b }) => {
      if (
        !Array.isArray(x) || !Array.isArray(k0) || !Array.isArray(k1) ||
        !Array.isArray(v0) || !Array.isArray(v1) || !Array.isArray(W) || !Array.isArray(b)
      ) return null;
      const xa = x as number[];
      const ln_x = layerNormFn(xa);
      const [w0, w1] = softmaxArr([
        scaledDotFn(ln_x, k0 as number[]),
        scaledDotFn(ln_x, k1 as number[]),
      ]);
      const attn = (v0 as number[]).map((vi, i) => r(w0 * vi + w1 * (v1 as number[])[i]));
      const res1 = xa.map((xi, i) => r(xi + attn[i]));
      const ln_res1 = layerNormFn(res1);
      const ffn = ln_res1.map((xi, i) =>
        Math.max(0, r(r((W as number[])[i] * xi) + (b as number[])[i]))
      );
      return res1.map((xi, i) => r(xi + ffn[i]));
    },
  },
};
