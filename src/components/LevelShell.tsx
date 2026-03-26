import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import ProgressBar from './ProgressBar';
import UnlockAnimation from './UnlockAnimation';
import NietzscheSprite from './NietzscheSprite';
import type { NietzscheExpression } from './NietzscheSprite';
import type { LevelMeta } from '../data/levels';

interface LevelShellProps {
  meta: LevelMeta;
  children: (props: { onCorrect: () => void; onWrong: () => void; solved: boolean }) => React.ReactNode;
}

export default function LevelShell({ meta, children }: LevelShellProps) {
  const navigate = useNavigate();
  const completeLevel = useProgressStore((s) => s.completeLevel);
  const isCompleted = useProgressStore((s) => s.isCompleted(meta.id));

  const [expression, setExpression] = useState<NietzscheExpression>('idle');
  const [hint, setHint] = useState('');
  const [solved, setSolved] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  const handleCorrect = () => {
    setExpression('right');
    setHint('');
    setSolved(true);
    completeLevel(meta.id);
  };

  const handleWrong = () => {
    setExpression('wrong');
    setHint('Nietzsche is disappointed. Try again.');
    setTimeout(() => { setExpression('idle'); setHint(''); }, 2500);
  };

  const handleContinue = () => {
    setShowUnlock(true);
  };

  const handleUnlockDone = () => {
    setShowUnlock(false);
    if (meta.id === 8) {
      navigate('/final');
    } else {
      navigate('/hub');
    }
  };

  const alreadyDone = isCompleted && !solved;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono">
      <ProgressBar />
      <div className="pt-16 px-6 max-w-4xl mx-auto pb-16">

        {/* Back button */}
        <button
          onClick={() => navigate('/hub')}
          className="mt-6 mb-8 text-sm text-gray-300 hover:text-[#f5c518] transition-colors tracking-widest"
        >
          ← BACK TO HUB
        </button>

        {/* Level header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <p className="text-sm tracking-widest" style={{ color: meta.color }}>
              LEVEL {meta.id} · {meta.concept.toUpperCase()}
            </p>
            {/* Completed badge — shown in header, never obtrusive */}
            {(alreadyDone || solved) && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs px-2 py-0.5 border border-green-700 text-green-400 tracking-widest"
              >
                ✓ COMPLETE
              </motion.span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            {meta.title}
          </h1>
          <p className="text-lg italic text-gray-200 border-l-2 pl-4" style={{ borderColor: meta.color }}>
            "{meta.hook}"
          </p>
        </motion.div>

        <div className="w-full h-px bg-[#2a2a2a] mb-8" />

        {/* Nietzsche + feedback */}
        <div className="flex items-start gap-6 mb-8">
          <div className="shrink-0">
            <NietzscheSprite expression={expression} size={80} />
          </div>
          <AnimatePresence mode="wait">
            {hint && (
              <motion.div
                key="wrong"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 mt-4 px-4 py-3 border border-red-800 bg-red-950/20 text-red-400 text-base"
              >
                {hint}
              </motion.div>
            )}
            {solved && !hint && (
              <motion.div
                key="correct"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 mt-4 px-4 py-3 border border-green-700 bg-green-950/20 text-green-300 text-base"
              >
                <p className="font-bold mb-1">Nietzsche approves. The machine learns.</p>
                <p className="text-gray-300">Study the result below, then hit Continue when ready.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Puzzle content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111111] border border-[#2a2a2a] p-6 rounded-sm"
        >
          {children({ onCorrect: handleCorrect, onWrong: handleWrong, solved })}
        </motion.div>

        {/* CONTINUE button — only after solving, not after revisit */}
        <AnimatePresence>
          {solved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-end"
            >
              <button
                onClick={handleContinue}
                className="pulse-glow px-10 py-4 border-2 border-[#f5c518] text-[#f5c518] font-bold tracking-widest hover:bg-[#f5c518] hover:text-black transition-colors text-base"
              >
                CONTINUE →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <UnlockAnimation
        show={showUnlock}
        message={meta.unlockMessage}
        color={meta.color}
        onComplete={handleUnlockDone}
      />
    </div>
  );
}
