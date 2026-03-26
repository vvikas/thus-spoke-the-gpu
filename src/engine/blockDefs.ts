import type { BlockDef } from './types';

const r = (n: number) => Math.round(n * 1000) / 1000;

export const BLOCK_DEFS: Record<string, BlockDef> = {

  // ── Arithmetic ─────────────────────────────────────────────────────────────
  multiply: {
    label: 'MULTIPLY',
    category: 'primitive',
    inputs: ['a', 'b'],
    description: 'Element-wise: [a₀b₀, a₁b₁, …]',
    code: 'a * b',
    color: '#4cc9f0',
    compute: ({ a, b }) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return null;
      if ((a as number[]).length !== (b as number[]).length) return null;
      return (a as number[]).map((v, i) => r(v * (b as number[])[i]));
    },
  },

  sum: {
    label: 'SUM',
    category: 'primitive',
    inputs: ['x'],
    description: 'Sum all elements → scalar',
    code: 'x.sum()',
    color: '#f72585',
    compute: ({ x }) => {
      if (!Array.isArray(x)) return null;
      return r((x as number[]).reduce((a, b) => a + b, 0));
    },
  },

  exp: {
    label: 'EXP',
    category: 'primitive',
    inputs: ['x'],
    description: 'Apply eˣ to each element',
    code: 'torch.exp(x)',
    color: '#f5c518',
    compute: ({ x }) => {
      if (!Array.isArray(x)) return null;
      return (x as number[]).map(v => r(Math.exp(v)));
    },
  },

  divide: {
    label: 'DIVIDE',
    category: 'primitive',
    inputs: ['vec', 'by'],
    description: 'vec ÷ by (works scalar or vector / scalar)',
    code: 'vec / by',
    color: '#06d6a0',
    compute: ({ vec, by }) => {
      if (typeof by !== 'number' || (by as number) === 0) return null;
      if (typeof vec === 'number') return r((vec as number) / (by as number));
      if (Array.isArray(vec)) return (vec as number[]).map(v => r(v / (by as number)));
      return null;
    },
  },

  add_vecs: {
    label: 'ADD',
    category: 'primitive',
    inputs: ['a', 'b'],
    description: 'Element-wise vector addition',
    code: 'a + b',
    color: '#3a86ff',
    compute: ({ a, b }) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return null;
      if ((a as number[]).length !== (b as number[]).length) return null;
      return (a as number[]).map((x, i) => r(x + (b as number[])[i]));
    },
  },

  mul_scalar_vec: {
    label: 'SCALE VEC',
    category: 'primitive',
    inputs: ['w', 'v'],
    description: 'Multiply each element of v by scalar w',
    code: 'w * v',
    color: '#e07b39',
    compute: ({ w, v }) => {
      if (typeof w !== 'number' || !Array.isArray(v)) return null;
      return (v as number[]).map(x => r(x * (w as number)));
    },
  },

  max_vec: {
    label: 'MAX',
    category: 'primitive',
    inputs: ['a', 'b'],
    description: 'Element-wise max(a, b)',
    code: 'torch.maximum(a, b)',
    color: '#ff6b6b',
    compute: ({ a, b }) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return null;
      if ((a as number[]).length !== (b as number[]).length) return null;
      return (a as number[]).map((v, i) => Math.max(v, (b as number[])[i]));
    },
  },

  sub_scalar: {
    label: 'SUBTRACT',
    category: 'primitive',
    inputs: ['vec', 'c'],
    description: 'Subtract scalar from each element',
    code: 'x - c',
    color: '#4895ef',
    compute: ({ vec, c }) => {
      if (!Array.isArray(vec) || typeof c !== 'number') return null;
      return (vec as number[]).map(v => r(v - (c as number)));
    },
  },

  mean_vec: {
    label: 'MEAN',
    category: 'primitive',
    inputs: ['x'],
    description: 'Average of all elements → scalar',
    code: 'x.mean()',
    color: '#9b5de5',
    compute: ({ x }) => {
      if (!Array.isArray(x) || (x as number[]).length === 0) return null;
      const arr = x as number[];
      return r(arr.reduce((a, b) => a + b, 0) / arr.length);
    },
  },

  sqrt_scalar: {
    label: 'SQRT',
    category: 'primitive',
    inputs: ['x'],
    description: '√x — square root of a scalar',
    code: 'math.sqrt(x)',
    color: '#00b4d8',
    compute: ({ x }) => {
      if (typeof x !== 'number' || (x as number) < 0) return null;
      return r(Math.sqrt(x as number));
    },
  },

  pack2: {
    label: 'PACK',
    category: 'primitive',
    inputs: ['x0', 'x1'],
    description: 'Bundle two scalars → [x0, x1] vector',
    code: 'torch.stack([x0, x1])',
    color: '#80ed99',
    compute: ({ x0, x1 }) => {
      if (typeof x0 !== 'number' || typeof x1 !== 'number') return null;
      return [x0 as number, x1 as number];
    },
  },

  index0: {
    label: 'VEC[0]',
    category: 'primitive',
    inputs: ['vec'],
    description: 'Extract first element of vector',
    code: 'x[0]',
    color: '#ff9f1c',
    compute: ({ vec }) => {
      if (!Array.isArray(vec) || (vec as number[]).length === 0) return null;
      return (vec as number[])[0];
    },
  },

  index1: {
    label: 'VEC[1]',
    category: 'primitive',
    inputs: ['vec'],
    description: 'Extract second element of vector',
    code: 'x[1]',
    color: '#ff9f1c',
    compute: ({ vec }) => {
      if (!Array.isArray(vec) || (vec as number[]).length < 2) return null;
      return (vec as number[])[1];
    },
  },

  // ── Output passthrough ─────────────────────────────────────────────────────
  result: {
    label: 'OUTPUT',
    category: 'output',
    inputs: ['in'],
    description: '',
    code: '',
    color: '#06d6a0',
    compute: ({ in: val }) => val ?? null,
  },
};
