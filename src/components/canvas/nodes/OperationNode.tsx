import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BLOCK_DEFS } from '../../../engine/blockDefs';
import type { Value } from '../../../engine/types';

function fmt(v: Value | null | undefined): string {
  if (v === null || v === undefined) return '???';
  if (Array.isArray(v)) return `[${(v as number[]).join(',  ')}]`;
  return String(v);
}

export default function OperationNode({ data }: NodeProps) {
  const def = BLOCK_DEFS[data.blockType as string];
  if (!def) return null;

  const val = data.computedValue as Value | null | undefined;
  const hasVal = val !== null && val !== undefined;
  const inputCount = def.inputs.length;
  const handlePositions = def.inputs.map((_, i) => `${((i + 1) / (inputCount + 1)) * 100}%`);

  return (
    <div
      className="relative"
      style={{
        background: 'var(--surface)',
        border: `1.5px solid ${hasVal ? def.color : 'var(--border2)'}`,
        borderRadius: 12,
        padding: '14px 18px',
        minWidth: 200,
        boxShadow: hasVal ? `0 0 24px ${def.color}2a` : undefined,
        overflow: 'visible',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Input handles + port labels */}
      {def.inputs.map((port, i) => (
        <div key={port}>
          <Handle
            id={port}
            type="target"
            position={Position.Left}
            style={{
              top: handlePositions[i],
              width: 14, height: 14,
              background: hasVal ? def.color : 'var(--border2)',
              border: `2px solid ${hasVal ? def.color : 'var(--border2)'}`,
            }}
          />
          {inputCount > 1 && (
            <div
              style={{
                position: 'absolute',
                top: `calc(${handlePositions[i]} - 9px)`,
                right: 'calc(100% + 22px)',
                fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                color: hasVal ? def.color : 'var(--muted)',
                whiteSpace: 'nowrap', pointerEvents: 'none', textAlign: 'right',
              }}
            >
              {port}
            </div>
          )}
        </div>
      ))}

      {/* Block label */}
      <div style={{ fontSize: 10, letterSpacing: '0.2em', fontWeight: 700, marginBottom: 4, color: hasVal ? def.color : 'var(--dim)' }}>
        {def.label}
      </div>

      {/* Description */}
      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>{def.description}</div>

      {/* Code snippet */}
      <div style={{
        background: 'var(--surface2)', borderRadius: 6,
        padding: '4px 10px', fontFamily: 'monospace',
        fontSize: 11, color: 'var(--muted)', marginBottom: 10,
        border: '1px solid var(--border)',
      }}>
        {def.code}
      </div>

      {/* Computed value */}
      <div style={{
        fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
        wordBreak: 'break-all', lineHeight: 1.4, minHeight: 20,
        color: hasVal ? def.color : 'var(--border2)',
        transition: 'color 0.3s',
      }}>
        {fmt(val)}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 14, height: 14,
          background: hasVal ? def.color : 'var(--border2)',
          border: `2px solid ${hasVal ? def.color : 'var(--border2)'}`,
        }}
      />
    </div>
  );
}
