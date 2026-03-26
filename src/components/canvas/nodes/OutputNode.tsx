import { Handle, Position, type NodeProps } from '@xyflow/react';
import { valuesMatch } from '../../../engine/evaluate';
import type { Value } from '../../../engine/types';

function fmt(v: Value | null | undefined): string {
  if (v === null || v === undefined) return '???';
  if (Array.isArray(v)) return `[${(v as number[]).map(n => n.toFixed(3)).join(', ')}]`;
  return typeof v === 'number' ? (v % 1 === 0 ? String(v) : v.toFixed(3)) : String(v);
}

export default function OutputNode({ data }: NodeProps) {
  const val = data.computedValue as Value | null | undefined;
  const target = data.target as Value;
  const matched = valuesMatch(val, target);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `2px solid ${matched ? '#06d6a0' : 'var(--border2)'}`,
        borderRadius: 12,
        padding: '14px 18px',
        minWidth: 200,
        boxShadow: matched ? '0 0 32px #06d6a044' : undefined,
        transition: 'border-color 0.4s, box-shadow 0.4s',
      }}
    >
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        style={{
          width: 14, height: 14,
          background: matched ? '#06d6a0' : 'var(--border2)',
          border: `2px solid ${matched ? '#06d6a0' : 'var(--border2)'}`,
        }}
      />

      <div style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: '0.2em', marginBottom: 10, fontWeight: 700 }}>
        OUTPUT
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--dim)', marginBottom: 4 }}>ACTUAL</div>
      <div
        style={{
          fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
          wordBreak: 'break-all', lineHeight: 1.5, minHeight: 28,
          color: matched ? '#06d6a0' : val != null ? 'var(--muted)' : 'var(--border2)',
          transition: 'color 0.3s',
        }}
      >
        {fmt(val)}
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--dim)', marginTop: 10, marginBottom: 4 }}>TARGET</div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)', wordBreak: 'break-all', lineHeight: 1.4 }}>
        {fmt(target)}
      </div>

      {matched && (
        <div style={{ marginTop: 10, fontSize: 10, letterSpacing: '0.25em', fontWeight: 700, color: '#06d6a0' }}>
          ✓ CORRECT
        </div>
      )}
    </div>
  );
}
