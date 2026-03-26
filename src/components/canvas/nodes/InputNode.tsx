import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Value } from '../../../engine/types';

function fmt(v: Value | null | undefined): string {
  if (v === null || v === undefined) return '???';
  if (Array.isArray(v)) return `[${(v as number[]).join(', ')}]`;
  return String(v);
}

export default function InputNode({ data }: NodeProps) {
  const val = data.fixedValue as Value;
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1.5px solid #f5c518',
        borderRadius: 12,
        padding: '12px 18px',
        minWidth: 170,
        boxShadow: '0 0 20px #f5c51822',
      }}
    >
      <div style={{ fontSize: 10, color: '#f5c518', letterSpacing: '0.2em', marginBottom: 6, fontWeight: 700 }}>
        INPUT
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text)' }}>
        {data.label as string}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#f5c518', wordBreak: 'break-all', lineHeight: 1.6 }}>
        {fmt(val)}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 14, height: 14, background: '#f5c518', border: '2px solid #f5c518' }}
      />
    </div>
  );
}
