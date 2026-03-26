import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TITLE = 'THUS SPOKE THE GPU';
const SUBTITLE = 'The GPU has spoken. Can you understand it?';
const CTA = 'First, you must build the brain.';

function TypeWriter({ text, delay = 0, speed = 40 }: { text: string; delay?: number; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed]);

  return <span>{displayed}<span className="animate-pulse">█</span></span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowSubtitle(true), 2200);
    const t2 = setTimeout(() => setShowCTA(true), 4500);
    const t3 = setTimeout(() => setShowButton(true), 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,197,24,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,197,24,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }}
      />

      <div className="relative z-10 text-center px-8 max-w-4xl">
        {/* Title — letter by letter */}
        <motion.h1
          className="text-4xl md:text-7xl font-bold tracking-widest mb-8"
          style={{ color: '#f5c518', fontFamily: 'Courier New, monospace', textShadow: '0 0 30px rgba(245,197,24,0.5)' }}
        >
          {TITLE.split('').map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="w-full h-px bg-[#f5c518] opacity-40 mb-8"
        />

        {/* Subtitle */}
        <AnimatePresence>
          {showSubtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl md:text-2xl text-gray-300 mb-6 font-mono"
            >
              <TypeWriter text={SUBTITLE} speed={35} />
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA line */}
        <AnimatePresence>
          {showCTA && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg text-[#f5c518] opacity-80 mb-12 italic font-mono"
            >
              <TypeWriter text={CTA} speed={40} />
            </motion.p>
          )}
        </AnimatePresence>

        {/* Button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/hub')}
              className="pulse-glow px-10 py-4 text-xl font-bold tracking-widest border-2 border-[#f5c518] text-[#f5c518] bg-transparent hover:bg-[#f5c518] hover:text-black transition-colors duration-200 cursor-pointer font-mono"
            >
              ENTER
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bottom credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 7 }}
          className="mt-16 text-xs text-gray-600 font-mono"
        >
          8 LEVELS · 1 PHILOSOPHER · 0 SANITY
        </motion.p>
      </div>
    </div>
  );
}
