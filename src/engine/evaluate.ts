import type { Node, Edge } from '@xyflow/react';
import type { Value } from './types';
import { BLOCK_DEFS } from './blockDefs';
import { CHIP_DEFS } from './chipDefs';

export function evaluate(
  nodes: Node[],
  edges: Edge[],
): Record<string, Value | null> {
  const values: Record<string, Value | null> = {};

  // Seed with input nodes (fixed values)
  nodes.forEach(n => {
    if (n.data.fixedValue !== undefined) {
      values[n.id] = n.data.fixedValue as Value;
    }
  });

  // Multi-pass propagation — resolves DAGs without explicit toposort
  for (let pass = 0; pass < nodes.length; pass++) {
    nodes.forEach(node => {
      if (values[node.id] !== undefined) return; // already computed

      // ── Chip node path ────────────────────────────────────────────────────
      if (node.type === 'chipNode') {
        const chip = CHIP_DEFS[node.data.chipId as string];
        if (!chip) return;

        const inputs: Record<string, Value> = {};
        edges.filter(e => e.target === node.id).forEach(e => {
          const v = values[e.source];
          if (v !== null && v !== undefined) {
            inputs[e.targetHandle as string] = v;
          }
        });

        const allReady = chip.inputs.every(p => inputs[p] !== undefined);
        if (allReady) values[node.id] = chip.compute(inputs);
        return;
      }

      // ── Primitive operation node path ─────────────────────────────────────
      const def = BLOCK_DEFS[node.data.blockType as string];
      if (!def) return;

      const inputs: Record<string, Value> = {};
      edges.filter(e => e.target === node.id).forEach(e => {
        const v = values[e.source];
        if (v !== null && v !== undefined) {
          inputs[(e.targetHandle as string) ?? 'x'] = v;
        }
      });

      const allReady = def.inputs.every(p => inputs[p] !== undefined);
      if (allReady) values[node.id] = def.compute(inputs);
    });
  }

  return values;
}

/** Check if two Values match within tolerance */
export function valuesMatch(a: Value | null | undefined, b: Value, tol = 0.01): boolean {
  if (a === null || a === undefined) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return (
      (a as number[]).length === (b as number[]).length &&
      (a as number[]).every((v, i) => Math.abs(v - (b as number[])[i]) < tol)
    );
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < tol;
  }
  return false;
}
