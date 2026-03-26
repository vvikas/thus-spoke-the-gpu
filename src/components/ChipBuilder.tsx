import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import InputNode from './canvas/nodes/InputNode';
import OperationNode from './canvas/nodes/OperationNode';
import OutputNode from './canvas/nodes/OutputNode';
import ChipNode from './canvas/nodes/ChipNode';
import { evaluate, valuesMatch } from '../engine/evaluate';
import { BLOCK_DEFS } from '../engine/blockDefs';
import { CHIP_DEFS } from '../engine/chipDefs';
import { LEVEL_DEFS } from '../data/levelDefs';
import { useProgressStore } from '../store/progressStore';
import { useSidebarResize } from '../hooks/useSidebarResize';
import type { Value } from '../engine/types';
import ThemeToggle from './ThemeToggle';
import { useThemeStore } from '../store/themeStore';

const NODE_TYPES = {
  inputNode: InputNode,
  operationNode: OperationNode,
  outputNode: OutputNode,
  chipNode: ChipNode,
};

type Tab = 'info' | 'palette' | 'tests';

interface TestResult {
  label: string;
  expected: Value;
  actual: Value | null;
  pass: boolean;
}

function fmt(v: Value | null | undefined): string {
  if (v === null || v === undefined) return '???';
  if (Array.isArray(v)) return `[${(v as number[]).map(n => n.toFixed(3)).join(', ')}]`;
  return typeof v === 'number' ? (v % 1 === 0 ? String(v) : v.toFixed(3)) : String(v);
}

export default function ChipBuilder({ levelId }: { levelId: number }) {
  const navigate = useNavigate();
  const level = LEVEL_DEFS.find(l => l.id === levelId);
  const { completeLevel, isCompleted, hasChip } = useProgressStore();
  const { theme } = useThemeStore();
  const alreadySolved = isCompleted(levelId);
  const [tab, setTab] = useState<Tab>('info');
  const [solved, setSolved] = useState(alreadySolved);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { width: sidebarWidth, onDragStart } = useSidebarResize();
  const nodeIdCounter = useRef(100);

  // ── Persistent canvas — load saved nodes/edges from localStorage ─────────
  const canvasKey = `tsg-canvas-${levelId}`;
  const savedCanvas = useMemo(() => {
    try {
      const raw = localStorage.getItem(canvasKey);
      return raw ? JSON.parse(raw) as { nodes: Node[]; edges: Edge[] } : null;
    } catch { return null; }
  }, [canvasKey]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    savedCanvas?.nodes ?? (level?.initialNodes.map(n => ({ ...n } as Node)) ?? [])
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(savedCanvas?.edges ?? []);

  // Always keep a ref to latest state so we can save synchronously on unmount
  const persistRef = useRef({ nodes, edges });
  useEffect(() => { persistRef.current = { nodes, edges }; }, [nodes, edges]);

  // Save on unmount (synchronous — prevents debounce cancel losing last state)
  useEffect(() => {
    return () => {
      localStorage.setItem(canvasKey, JSON.stringify(persistRef.current));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasKey]);

  // Also debounce-save while editing (keeps localStorage fresh mid-session)
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(canvasKey, JSON.stringify({ nodes, edges }));
    }, 400);
    return () => clearTimeout(t);
  }, [nodes, edges, canvasKey]);

  if (!level) return <div className="text-white p-8">Level {levelId} not found.</div>;

  // ── Evaluate all test cases whenever edges change ───────────────────────────
  useEffect(() => {
    // Evaluate the live canvas
    const liveValues = evaluate(nodes, edges);
    setNodes(ns =>
      ns.map(n => ({ ...n, data: { ...n.data, computedValue: liveValues[n.id] ?? null } }))
    );

    // Run all test cases
    const results: TestResult[] = level.testCases.map(tc => {
      // Build a patched node list where input nodes get tc.inputs values
      const patchedNodes = nodes.map(n => {
        if (tc.inputs[n.id] !== undefined) {
          return { ...n, data: { ...n.data, fixedValue: tc.inputs[n.id] } };
        }
        return n;
      });
      const vals = evaluate(patchedNodes, edges);
      const actual = vals['output'] ?? null;
      return {
        label: tc.label,
        expected: tc.expected,
        actual,
        pass: valuesMatch(actual, tc.expected),
      };
    });
    setTestResults(results);

    const allPass = results.every(r => r.pass);
    if (allPass && !solved) {
      setSolved(true);
      completeLevel(levelId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges(eds =>
        addEdge(
          { ...connection, style: { stroke: '#555', strokeWidth: 2.5 }, type: 'smoothstep' },
          eds,
        )
      ),
    []
  );

  // ── Add operation node from palette ────────────────────────────────────────
  const addOpNode = (blockType: string) => {
    const id = `op_${nodeIdCounter.current++}`;
    const newNode: Node = {
      id,
      type: 'operationNode',
      position: { x: 350 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { blockType, computedValue: null },
    };
    setNodes(ns => [...ns, newNode]);
  };

  // ── Add chip node from palette ──────────────────────────────────────────────
  const addChipNode = (chipId: string) => {
    const id = `chip_${nodeIdCounter.current++}`;
    const newNode: Node = {
      id,
      type: 'chipNode',
      position: { x: 350 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { chipId, computedValue: null },
    };
    setNodes(ns => [...ns, newNode]);
  };

  // ── Available chips for this level ─────────────────────────────────────────
  const availableChips = Object.values(CHIP_DEFS).filter(
    chip => chip.unlockedByLevel < levelId && hasChip(chip.id)
  );

  const allTestsPass = testResults.length > 0 && testResults.every(r => r.pass);

  return (
    <div className="flex h-screen font-mono overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col overflow-hidden"
        style={{ width: sidebarWidth, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => navigate('/hub')}
            className="text-sm tracking-widest transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            ← HUB
          </button>
          <span style={{ color: 'var(--border2)' }}>|</span>
          <span className="text-sm font-bold tracking-widest" style={{ color: level.color }}>
            LEVEL {level.id}
          </span>
          {(solved || alreadySolved) && (
            <span className="text-xs px-2 py-0.5 border border-green-700 text-green-400 tracking-widest">
              ✓ DONE
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset canvas? Your wiring will be cleared.')) {
                  localStorage.removeItem(canvasKey);
                  setNodes(level.initialNodes.map(n => ({ ...n } as Node)));
                  setEdges([]);
                  setSolved(alreadySolved);
                }
              }}
              className="text-xs tracking-widest transition-colors px-2 py-1"
              style={{ color: 'var(--faint)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--faint)')}
            >
              RESET
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Title */}
        <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="text-xl font-bold leading-tight" style={{ color: 'var(--text)' }}>{level.title}</div>
          <div className="text-xs mt-1 tracking-wider" style={{ color: 'var(--muted)' }}>{level.concept}</div>
        </div>

        {/* Tab buttons */}
        <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          {(['info', 'palette', 'tests'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-xs tracking-widest font-bold transition-colors"
              style={{
                color: tab === t ? level.color : '#444',
                borderBottom: tab === t ? `2px solid ${level.color}` : '2px solid transparent',
                background: tab === t ? `${level.color}08` : 'transparent',
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'info' && <InfoTab level={level} />}
          {tab === 'palette' && (
            <PaletteTab
              level={level}
              availableChips={availableChips.map(c => c.id)}
              onAddOp={addOpNode}
              onAddChip={addChipNode}
            />
          )}
          {tab === 'tests' && (
            <TestsTab results={testResults} level={level} />
          )}
        </div>

        {/* Solve / Continue footer */}
        <div className="shrink-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
          {allTestsPass && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-green-400 tracking-widest font-bold text-center">
                ✓ ALL TESTS PASS — CHIP UNLOCKED
              </div>
              <button
                onClick={() => {
                  if (levelId === 9) {
                    navigate('/final');
                  } else {
                    navigate(`/level/${levelId + 1}`);
                  }
                }}
                className="w-full py-3 text-sm tracking-widest border-2 text-black font-bold transition-colors"
                style={{ background: level.color, borderColor: level.color }}
              >
                {levelId === 9 ? 'FINISH →' : `LEVEL ${levelId + 1} →`}
              </button>
            </div>
          )}
          {!allTestsPass && (
            <div className="text-xs text-gray-600 tracking-widest text-center">
              {testResults.filter(r => r.pass).length}/{testResults.length} tests passing
            </div>
          )}
          {(alreadySolved || solved) && !allTestsPass && (
            <button
              onClick={() => navigate('/hub')}
              className="mt-2 w-full py-2 text-xs tracking-widest border border-gray-700 text-gray-500 hover:text-white transition-colors"
            >
              BACK TO HUB
            </button>
          )}
        </div>
      </div>

      {/* ── Drag handle ─────────────────────────────────────────────────── */}
      <div
        onMouseDown={onDragStart}
        className="w-1 shrink-0 bg-[#1a1a1a] hover:bg-[#f5c518] cursor-col-resize transition-colors duration-150 active:bg-[#f5c518]"
      />

      {/* ── Canvas ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#444', strokeWidth: 2.5 } }}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color={theme === 'dark' ? '#1e1e1e' : '#d4d2c8'} variant={BackgroundVariant.Dots} gap={28} size={1.5} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

// ── Description renderer — prose or numbered steps ────────────────────────────
function DescriptionBody({ text, color }: { text: string; color: string }) {
  // Split on (1) (2) ... pattern — if found, render as step list
  const parts = text.split(/(\(\d+\))/);
  const hasSteps = parts.length > 1 && parts.some(p => /^\(\d+\)$/.test(p));

  if (!hasSteps) {
    return <p className="text-sm leading-6" style={{ color: 'var(--text2)' }}>{text}</p>;
  }

  // Pair each "(N)" marker with the text that follows it
  const steps: { n: string; body: string }[] = [];
  let preamble = '';
  for (let i = 0; i < parts.length; i++) {
    if (/^\(\d+\)$/.test(parts[i])) {
      steps.push({ n: parts[i].slice(1, -1), body: (parts[i + 1] ?? '').trim() });
      i++; // skip the body we just consumed
    } else if (steps.length === 0) {
      preamble += parts[i];
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {preamble.trim() && (
        <p className="text-sm leading-6 mb-1" style={{ color: 'var(--text2)' }}>{preamble.trim()}</p>
      )}
      {steps.map(({ n, body }) => (
        <div key={n} className="flex items-start gap-3 py-2 px-3 rounded-lg"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
            style={{ background: color, color: '#000', minWidth: '1.25rem' }}
          >
            {n}
          </span>
          <span className="text-sm leading-5" style={{ color: 'var(--text2)' }}>{body}</span>
        </div>
      ))}
    </div>
  );
}

// ── Info tab ──────────────────────────────────────────────────────────────────
function InfoTab({ level }: { level: (typeof LEVEL_DEFS)[0] }) {
  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <div className="text-xs tracking-widest mb-2 font-bold" style={{ color: 'var(--dim)' }}>GOAL</div>
        <DescriptionBody text={level.description} color={level.color} />
      </div>

      <div className="rounded-xl p-4" style={{ border: '1px solid var(--border3)', background: 'var(--surface2)' }}>
        <div className="text-xs tracking-widest mb-2 font-bold" style={{ color: 'var(--dim)' }}>MATH</div>
        <div className="font-mono text-lg font-bold" style={{ color: level.color }}>{level.math}</div>
      </div>

      <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)', background: 'var(--surface3)' }}>
        <div className="text-xs tracking-widest mb-2 font-bold" style={{ color: 'var(--dim)' }}>IN GPT</div>
        <pre className="text-xs leading-6 whitespace-pre-wrap overflow-x-auto" style={{ color: 'var(--gpt-code)' }}>{level.gptCode}</pre>
      </div>

      <div className="rounded-xl p-4" style={{ borderColor: `${level.color}44`, background: `${level.color}08`, border: `1px solid ${level.color}44` }}>
        <div className="text-xs tracking-widest mb-2 font-bold" style={{ color: level.color }}>PRODUCES CHIP</div>
        <div className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>⬡ {CHIP_DEFS[level.producesChip]?.label ?? level.producesChip}</div>
        <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Available in all future levels</div>
      </div>

      <div className="rounded-xl p-4" style={{ border: '1px solid var(--border3)', background: 'var(--surface2)' }}>
        <div className="text-xs tracking-widest mb-1 font-bold" style={{ color: 'var(--dim)' }}>HOW TO WIRE</div>
        <p className="text-xs leading-5" style={{ color: 'var(--muted)' }}>
          Click a block in the Palette tab to add it to the canvas. Hover a block — a ● handle appears on its edge. Drag to connect.
        </p>
      </div>
    </div>
  );
}

// ── Palette tab ───────────────────────────────────────────────────────────────
function PaletteTab({
  level,
  availableChips,
  onAddOp,
  onAddChip,
}: {
  level: (typeof LEVEL_DEFS)[0];
  availableChips: string[];
  onAddOp: (blockType: string) => void;
  onAddChip: (chipId: string) => void;
}) {
  const primitives = level.availablePrimitives;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <div className="text-xs tracking-widest mb-3 font-bold" style={{ color: 'var(--dim)' }}>PRIMITIVES</div>
        <div className="flex flex-col gap-2">
          {primitives.map(bt => {
            const def = BLOCK_DEFS[bt];
            if (!def) return null;
            return (
              <button
                key={bt}
                onClick={() => onAddOp(bt)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left w-full"
                style={{ border: '1px solid var(--border2)', background: 'var(--surface2)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--faint)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: def.color }} />
                <div>
                  <div className="text-xs font-bold tracking-wider" style={{ color: 'var(--text)' }}>{def.label}</div>
                  <div className="text-xs" style={{ color: 'var(--dim)' }}>{def.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {availableChips.length > 0 && (
        <div>
          <div className="text-xs tracking-widest mb-3 font-bold" style={{ color: '#f5c518' }}>
            YOUR CHIPS ⬡
          </div>
          <div className="flex flex-col gap-2">
            {availableChips.map(chipId => {
              const chip = CHIP_DEFS[chipId];
              if (!chip) return null;
              return (
                <button
                  key={chipId}
                  onClick={() => onAddChip(chipId)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left w-full"
                  style={{ border: `1px solid ${chip.color}55`, background: `${chip.color}08` }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: chip.color }} />
                  <div>
                    <div className="text-xs font-bold tracking-wider" style={{ color: chip.color }}>
                      ⬡ {chip.label}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--dim)' }}>{chip.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tests tab ─────────────────────────────────────────────────────────────────
function TestsTab({
  results,
  level,
}: {
  results: TestResult[];
  level: (typeof LEVEL_DEFS)[0];
}) {
  if (results.length === 0) {
    return (
      <div className="p-5 text-xs" style={{ color: 'var(--dim)' }}>
        Connect nodes to see test results.
      </div>
    );
  }

  const passing = results.filter(r => r.pass).length;

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs tracking-widest font-bold" style={{ color: 'var(--dim)' }}>TEST CASES</div>
        <div
          className="text-xs font-bold tracking-widest"
          style={{ color: passing === results.length ? '#06d6a0' : '#888' }}
        >
          {passing}/{results.length} PASS
        </div>
      </div>

      {results.map((r, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{
            border: `1px solid ${r.pass ? '#06d6a055' : 'var(--border2)'}`,
            background: r.pass ? 'color-mix(in srgb, #06d6a0 6%, var(--surface2))' : 'var(--surface2)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold" style={{ color: 'var(--dim)' }}>CASE {i + 1}</div>
            <div
              className="text-xs font-bold tracking-widest"
              style={{ color: r.pass ? '#06d6a0' : '#555' }}
            >
              {r.pass ? '✓ PASS' : '✗ FAIL'}
            </div>
          </div>
          <div className="font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>{r.label}</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs w-14" style={{ color: 'var(--dim)' }}>target:</span>
              <span className="font-mono text-xs" style={{ color: level.color }}>
                {fmt(r.expected)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-14" style={{ color: 'var(--dim)' }}>actual:</span>
              <span
                className="font-mono text-xs"
                style={{ color: r.actual != null ? (r.pass ? '#06d6a0' : '#ff6b6b') : '#333' }}
              >
                {fmt(r.actual)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
