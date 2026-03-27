import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NietzscheSprite from '../components/NietzscheSprite';
import type { NietzscheExpression } from '../components/NietzscheSprite';
import { PHILOSOPHIZE_QUOTES } from '../data/quotes';

const BLOCK_LABELS = ['ReLU', 'LayerNorm', 'Attention', '+', 'LayerNorm', 'FFN·ReLU', '+', '× 6', '🧠'];
const BLOCK_COLORS = ['#ff6b6b', '#f5c518', '#f72585', '#e07b39', '#f5c518', '#ef476f', '#e07b39', '#06d6a0', '#3a86ff'];

const SHARE_QUOTE = 'God is not dead. He simply ran out of compute.';

function TypeWriter({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) { clearInterval(interval); return; }
      setDisplayed(text.slice(0, ++i));
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <span>{displayed}{displayed.length < text.length && <span className="animate-pulse">█</span>}</span>;
}

export default function FinalUnlock() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'assembly' | 'dark' | 'candle' | 'nietzsche' | 'speaking' | 'done'>('assembly');
  const [expression, setExpression] = useState<NietzscheExpression>('idle');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(PHILOSOPHIZE_QUOTES[0]);

  useEffect(() => {
    const phases: Array<[typeof phase, number]> = [
      ['assembly', 2500],
      ['dark', 800],
      ['candle', 1200],
      ['nietzsche', 1500],
      ['speaking', 0],
    ];
    let t: ReturnType<typeof setTimeout>;
    const runPhase = (idx: number) => {
      if (idx >= phases.length) { setPhase('done'); return; }
      const [p, delay] = phases[idx];
      setPhase(p);
      if (delay > 0) t = setTimeout(() => runPhase(idx + 1), delay);
    };
    runPhase(0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'speaking') {
      setExpression('speaking');
    }
  }, [phase]);

  const philosophizeAgain = () => {
    const nextIdx = (quoteIdx + 1) % PHILOSOPHIZE_QUOTES.length;
    setQuoteIdx(nextIdx);
    setCurrentQuote(PHILOSOPHIZE_QUOTES[nextIdx]);
    setExpression('thinking');
    setTimeout(() => setExpression('speaking'), 600);
  };

  const shareText = `I just assembled a transformer architecture from scratch — 9 levels of chips, from dot product to transformer block. A pixel-art Nietzsche told me:\n\n"${SHARE_QUOTE}"\n\nThus Spoke the GPU 🧠`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono overflow-hidden relative">
      {/* Assembly Phase */}
      <AnimatePresence>
        {phase === 'assembly' && (
          <motion.div
            key="assembly"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
          >
            <p className="text-[#f5c518] text-xl tracking-widest mb-12 glow-gold-text">ASSEMBLING THE BRAIN...</p>
            <div className="flex flex-wrap gap-3 justify-center max-w-lg">
              {BLOCK_LABELS.map((label, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.25, type: 'spring', stiffness: 200 }}
                  className="px-4 py-3 border-2 text-sm font-bold"
                  style={{ borderColor: BLOCK_COLORS[i], color: BLOCK_COLORS[i], boxShadow: `0 0 15px ${BLOCK_COLORS[i]}40` }}
                >
                  {label}
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.2, type: 'spring' }}
              className="mt-10 text-6xl"
            >
              🧠
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark phase */}
      <AnimatePresence>
        {phase === 'dark' && (
          <motion.div
            key="dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-20"
          />
        )}
      </AnimatePresence>

      {/* Candle + Nietzsche + Speaking phases */}
      <AnimatePresence>
        {(phase === 'candle' || phase === 'nietzsche' || phase === 'speaking' || phase === 'done') && (
          <motion.div
            key="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6"
          >
            {/* Candle */}
            <AnimatePresence>
              {(phase === 'candle' || phase === 'nietzsche' || phase === 'speaking' || phase === 'done') && (
                <motion.div
                  key="candle"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  className="absolute bottom-32 left-1/2 -translate-x-1/2 text-4xl flicker"
                  style={{ transformOrigin: 'bottom center' }}
                >
                  🕯
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desk scene */}
            <AnimatePresence>
              {(phase === 'nietzsche' || phase === 'speaking' || phase === 'done') && (
                <motion.div
                  key="desk"
                  initial={{ x: -400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 80 }}
                  className="flex flex-col items-center"
                >
                  <NietzscheSprite expression={expression} size={140} />
                  <div className="w-48 h-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm -mt-2" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speech bubble */}
            <AnimatePresence>
              {(phase === 'speaking' || phase === 'done') && (
                <motion.div
                  key="speech"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="mt-6 max-w-lg p-6 border-2 border-[#f5c518] bg-[#111] text-center"
                  style={{ boxShadow: '0 0 40px rgba(245,197,24,0.2)' }}
                >
                  <p className="text-[#f5c518] text-xl italic leading-relaxed">
                    <TypeWriter key={currentQuote} text={`"${currentQuote}"`} speed={35} />
                  </p>
                  <p className="text-gray-700 text-xs mt-3">— Thus Spoke the GPU</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <AnimatePresence>
              {phase === 'done' && (
                <motion.div
                  key="buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex flex-wrap gap-3 justify-center"
                >
                  <button
                    onClick={() => navigate('/playground')}
                    className="px-5 py-3 border-2 border-[#06d6a0] text-[#06d6a0] hover:bg-[#06d6a0] hover:text-black transition-colors text-sm tracking-widest font-bold"
                    style={{ boxShadow: '0 0 20px rgba(6,214,160,0.3)' }}
                  >
                    LAUNCH THE GPT →
                  </button>
                  <button
                    onClick={philosophizeAgain}
                    className="px-5 py-3 border border-[#f5c518] text-[#f5c518] hover:bg-[#f5c518] hover:text-black transition-colors text-sm tracking-widest"
                  >
                    PHILOSOPHIZE AGAIN
                  </button>
                  <button
                    onClick={() => navigate('/real-or-ai')}
                    className="px-5 py-3 border border-[#f72585] text-[#f72585] hover:bg-[#f72585] hover:text-black transition-colors text-sm tracking-widest"
                  >
                    REAL OR AI?
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 border border-[#4cc9f0] text-[#4cc9f0] hover:bg-[#4cc9f0] hover:text-black transition-colors text-sm tracking-widest"
                  >
                    SHARE WISDOM
                  </a>
                  <button
                    onClick={() => navigate('/gpt-source')}
                    className="px-5 py-3 border-2 border-[#f5c518] text-[#f5c518] hover:bg-[#f5c518] hover:text-black transition-colors text-sm tracking-widest font-bold"
                    style={{ boxShadow: '0 0 20px rgba(245,197,24,0.2)' }}
                  >
                    SEE IT IN GPT.PY →
                  </button>
                  <button
                    onClick={() => navigate('/hub')}
                    className="px-5 py-3 border border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm tracking-widest"
                  >
                    ← BACK TO HUB
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completion text */}
            {(phase === 'speaking' || phase === 'done') && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="absolute top-8 text-center text-xs tracking-widest text-[#f5c518]"
              >
                ★ THE BRAIN IS COMPLETE ★
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase trigger: assembly → done after speaking starts */}
      {phase === 'speaking' && (
        <div
          className="hidden"
          ref={() => { setTimeout(() => setPhase('done'), 3000); }}
        />
      )}
    </div>
  );
}
