import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CHIP_DEFS } from '../../../engine/chipDefs';
import type { Value } from '../../../engine/types';

function fmt(v: Value | null | undefined): string {
  if (v === null || v === undefined) return '???';
  if (Array.isArray(v)) return `[${(v as number[]).map(n => n.toFixed(3)).join(', ')}]`;
  return typeof v === 'number' ? (v % 1 === 0 ? String(v) : v.toFixed(3)) : String(v);
}

export default function ChipNode({ data }: NodeProps) {
  const chip = CHIP_DEFS[data.chipId as string];
  if (!chip) return null;

  const val = data.computedValue as Value | null | undefined;
  const hasVal = val !== null && val !== undefined;
  const inputCount = chip.inputs.length;
  const handlePositions = chip.inputs.map((_, i) => `${((i + 1) / (inputCount + 1)) * 100}%`);

  return (
    <div
      className="relative"
      style={{
        background: 'var(--surface)',
        border: `2px solid ${hasVal ? chip.color : `${chip.color}55`}`,
        borderRadius: 12,
        padding: '14px 18px',
        minWidth: 220,
        boxShadow: hasVal ? `0 0 32px ${chip.color}33` : `0 0 12px ${chip.color}18`,
        overflow: 'visible',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* CHIP badge */}
      <div
        style={{
          position: 'absolute', top: -11, left: 14,
          background: chip.color, color: '#000',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
          padding: '2px 8px', borderRadius: 4,
        }}
      >
        CHIP
      </div>

      {/* Input handles */}
      {chip.inputs.map((port, i) => (
        <div key={port}>
          <Handle
            id={port}
            type="target"
            position={Position.Left}
            style={{
              top: handlePositions[i],
              width: 14, height: 14,
              background: hasVal ? chip.color : `${chip.color}55`,
              border: `2px solid ${hasVal ? chip.color : `${chip.color}88`}`,
            }}
          />
          {inputCount > 1 && (
            <div
              style={{
                position: 'absolute',
                top: `calc(${handlePositions[i]} - 9px)`,
                right: 'calc(100% + 22px)',
                fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                color: hasVal ? chip.color : `${chip.color}99`,
                whiteSpace: 'nowrap', pointerEvents: 'none', textAlign: 'right',
              }}
            >
              {port}
            </div>
          )}
        </div>
      ))}

      {/* Label */}
      <div style={{
        fontSize: 10, letterSpacing: '0.2em', fontWeight: 700,
        marginBottom: 4, marginTop: 4,
        color: hasVal ? chip.color : `${chip.color}cc`,
      }}>
        ⬡ {chip.label}
      </div>

      {/* Description */}
      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>
        {chip.description}
      </div>

      {/* Code */}
      <div style={{
        background: 'var(--surface2)', borderRadius: 6,
        padding: '4px 10px', fontFamily: 'monospace',
        fontSize: 11, color: 'var(--muted)', marginBottom: 10,
        border: `1px solid ${chip.color}33`,
      }}>
        {chip.code}
      </div>

      {/* Value */}
      <div style={{
        fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
        wordBreak: 'break-all', lineHeight: 1.4, minHeight: 20,
        color: hasVal ? chip.color : `${chip.color}44`,
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
          background: hasVal ? chip.color : `${chip.color}55`,
          border: `2px solid ${hasVal ? chip.color : `${chip.color}88`}`,
        }}
      />
    </div>
  );
}
