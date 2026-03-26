import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import { LEVEL_DEFS } from '../data/levelDefs';
import { CHIP_DEFS } from '../engine/chipDefs';
import ThemeToggle from '../components/ThemeToggle';

export default function Hub() {
  const navigate = useNavigate();
  const isUnlocked = useProgressStore((s) => s.isUnlocked);
  const isCompleted = useProgressStore((s) => s.isCompleted);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  const allLevelsComplete = LEVEL_DEFS.every(l => isCompleted(l.id));

  return (
    <div className="min-h-screen font-mono" style={{ background: 'var(--bg2)' }}>
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs tracking-[0.3em]" style={{ color: 'var(--gpt-code)' }}>THUS SPOKE THE GPU</div>
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-3" style={{ color: 'var(--text)' }}>
            Build a GPT<br />
            <span className="text-[#f5c518]">block by block.</span>
          </h1>
          <p className="text-base leading-7" style={{ color: 'var(--muted)' }}>
            Each level produces one chip — a reusable building block of the transformer.<br />
            Wire the primitives. Stack the chips. Wake the machine.
          </p>
        </motion.div>

        {/* Level list */}
        <div className="flex flex-col gap-3">
          {LEVEL_DEFS.map((level, i) => {
            const unlocked = isUnlocked(level.id);
            const completed = isCompleted(level.id);
            const isActive = unlocked && !completed;
            const chipDef = CHIP_DEFS[level.producesChip];

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => unlocked && navigate(`/level/${level.id}`)}
                className="flex items-center gap-5 rounded-lg px-5 py-4 transition-all duration-200 border"
                style={{
                  borderColor: completed ? '#166534' : isActive ? '#f5c518' : 'var(--border)',
                  background: completed
                    ? 'color-mix(in srgb, #166534 8%, var(--surface))'
                    : isActive
                    ? 'color-mix(in srgb, #f5c518 6%, var(--surface))'
                    : 'var(--surface)',
                  boxShadow: isActive ? `0 0 24px ${level.color}22` : undefined,
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                {/* Number / check */}
                <div
                  className="text-2xl font-bold w-8 shrink-0 text-center"
                  style={{ color: completed ? '#4ade80' : isActive ? level.color : 'var(--border2)' }}
                >
                  {completed ? '✓' : level.id}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base" style={{ color: 'var(--text)' }}>
                    {level.title}
                  </div>
                  <div className="text-sm mt-0.5 font-mono" style={{ color: 'var(--muted)' }}>
                    {level.concept}
                  </div>
                </div>

                {/* Chip badge */}
                {chipDef && (
                  <div
                    className="shrink-0 text-xs px-2 py-0.5 rounded font-bold tracking-wider hidden sm:block"
                    style={{
                      background: completed ? `${chipDef.color}22` : 'var(--surface2)',
                      color: completed ? chipDef.color : 'var(--dim)',
                      border: `1px solid ${completed ? chipDef.color + '55' : 'var(--border)'}`,
                    }}
                  >
                    ⬡ {chipDef.label}
                  </div>
                )}

                {/* Status */}
                <div className="shrink-0 text-xs tracking-widest">
                  {completed && <span className="text-green-500">DONE</span>}
                  {isActive && <span style={{ color: level.color }}>PLAY →</span>}
                  {!unlocked && <span style={{ color: 'var(--faint)' }}>LOCKED</span>}
                </div>
              </motion.div>
            );
          })}

          {/* GPT Playground — unlocks after all 8 levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: LEVEL_DEFS.length * 0.06 }}
            onClick={() => allLevelsComplete && navigate('/playground')}
            className="flex items-center gap-5 rounded-lg px-5 py-4 transition-all duration-200 border mt-2"
            style={{
              borderColor: allLevelsComplete ? '#06d6a0' : 'var(--border)',
              background: allLevelsComplete
                ? 'color-mix(in srgb, #06d6a0 8%, var(--surface))'
                : 'var(--surface)',
              boxShadow: allLevelsComplete ? '0 0 32px #06d6a022' : undefined,
              cursor: allLevelsComplete ? 'pointer' : 'not-allowed',
              opacity: allLevelsComplete ? 1 : 0.4,
            }}
          >
            <div className="text-2xl font-bold w-8 shrink-0 text-center" style={{ color: '#06d6a0' }}>
              🧠
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base" style={{ color: 'var(--text)' }}>
                Thus Spoke the GPU
              </div>
              <div className="text-sm mt-0.5 font-mono" style={{ color: 'var(--muted)' }}>
                See the architecture you assembled come alive
              </div>
            </div>
            <div className="shrink-0 text-xs tracking-widest" style={{ color: allLevelsComplete ? '#06d6a0' : 'var(--faint)' }}>
              {allLevelsComplete ? 'LAUNCH →' : 'LOCKED'}
            </div>
          </motion.div>
        </div>

        {/* Reset */}
        <div className="mt-10 text-center">
          <button
            onClick={() => { if (window.confirm('Reset all progress?')) resetProgress(); }}
            className="text-xs tracking-widest transition-colors"
            style={{ color: 'var(--faint)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--faint)')}
          >
            RESET PROGRESS
          </button>
        </div>
      </div>
    </div>
  );
}
