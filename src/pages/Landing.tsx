import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import ThemeToggle from '../components/ThemeToggle';
import { LEVEL_DEFS } from '../data/levelDefs';

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
  const { setTheme } = useThemeStore();
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Auto-detect theme by time if not previously set by the user
  useEffect(() => {
    const persisted = localStorage.getItem('thus-spoke-theme');
    if (!persisted) {
      const h = new Date().getHours();
      setTheme(h >= 7 && h < 20 ? 'light' : 'dark');
    }
  }, [setTheme]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowSubtitle(true), 2200);
    const t2 = setTimeout(() => setShowCTA(true), 4500);
    const t3 = setTimeout(() => setShowButton(true), 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,197,24,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,197,24,0.2) 1px, transparent 1px)
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

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center px-8">
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
          className="w-full h-px opacity-40 mb-8"
          style={{ background: '#f5c518' }}
        />

        {/* Subtitle */}
        <AnimatePresence>
          {showSubtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl md:text-2xl mb-6 font-mono"
              style={{ color: 'var(--text)' }}
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
              className="text-lg opacity-80 mb-12 italic font-mono"
              style={{ color: 'var(--gpt-code)' }}
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
      </div>

      {/* Bottom tagline — always visible, anchored to bottom */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 7 }}
        className="relative z-10 text-center text-xs font-mono pb-6 tracking-widest"
        style={{ color: 'var(--text)' }}
      >
        {LEVEL_DEFS.length} LEVELS · 1 PHILOSOPHER · 0 SANITY
      </motion.p>
    </div>
  );
}
