import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_QUOTES } from '../data/quotes';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const QUIZ = shuffle(QUIZ_QUOTES).slice(0, 5);

export default function RealOrAI() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const quote = QUIZ[current];
  const score = answers.filter(Boolean).length;

  const handleGuess = (guessReal: boolean) => {
    const correct = guessReal === quote.isReal;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    setRevealed(true);

    setTimeout(() => {
      setRevealed(false);
      if (current + 1 >= QUIZ.length) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1800);
  };

  const getResultMessage = () => {
    if (score === 5) return 'Perfect. You are the Übermensch of quote detection.';
    if (score >= 4) return 'Impressive. But the machine still has secrets.';
    if (score >= 3) return `${score}/5 — The machine has partially fooled you.`;
    if (score >= 2) return `${score}/5 — The machine has fooled you. Nietzsche approves.`;
    return '1/5 or less — You cannot distinguish man from machine. We are all the GPU now.';
  };

  const shareText = `I scored ${score}/5 on "Real Nietzsche or AI?" 🧠\n${getResultMessage()}\nThus Spoke the GPU`;

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] font-mono flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <p className="text-[#f5c518] text-7xl font-bold mb-4 glow-gold-text">{score}/5</p>
          <div className="w-full h-px bg-[#f5c518] opacity-30 mb-6" />
          <p className="text-lg text-gray-300 italic mb-8">"{getResultMessage()}"</p>

          {/* Quote breakdown */}
          <div className="space-y-2 mb-8 text-left">
            {QUIZ.map((q, i) => (
              <div
                key={i}
                className={`p-3 border text-xs ${answers[i] ? 'border-green-800 text-green-400' : 'border-red-900 text-red-400'}`}
              >
                <span className="opacity-60 mr-2">{answers[i] ? '✓' : '✗'}</span>
                <span className="italic">"{q.text.slice(0, 60)}..."</span>
                <span className="block mt-1 opacity-50">{q.isReal ? `Real — ${q.attribution}` : 'AI Generated'}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3 border border-[#f5c518] text-[#f5c518] hover:bg-[#f5c518] hover:text-black transition-colors tracking-widest"
            >
              SHARE SCORE
            </a>
            <button
              onClick={() => { setCurrent(0); setAnswers([]); setDone(false); setRevealed(false); }}
              className="px-8 py-3 border border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300 transition-colors tracking-widest text-sm"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={() => navigate('/final')}
              className="text-xs text-gray-700 hover:text-gray-500 transition-colors"
            >
              ← Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#f5c518] tracking-widest mb-2">REAL OR AI?</h1>
          <p className="text-gray-600 text-sm">Can you tell real Nietzsche from the machine?</p>
          <div className="mt-4 flex justify-center gap-2">
            {QUIZ.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: i < answers.length ? '#f5c518' : i === current ? '#f5c518' : '#2a2a2a', opacity: i < answers.length ? 0.8 : 1 }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-700 mt-2">{current + 1} / {QUIZ.length}</p>
        </div>

        {/* Quote card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 border border-[#2a2a2a] bg-[#111] mb-8 min-h-[160px] flex items-center justify-center"
          >
            <p className="text-center text-xl italic text-gray-200 leading-relaxed">
              "{quote.text}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Reveal feedback */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-3 border text-center text-sm overflow-hidden ${
                quote.isReal ? 'border-green-800 text-green-400 bg-green-950/20' : 'border-[#f72585]/50 text-[#f72585] bg-[#f72585]/5'
              }`}
            >
              {quote.isReal ? `✓ REAL NIETZSCHE — ${quote.attribution}` : '🤖 AI GENERATED — Thus Spoke the GPU'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        {!revealed && (
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGuess(true)}
              className="py-4 border-2 border-[#f5c518] text-[#f5c518] hover:bg-[#f5c518] hover:text-black transition-colors font-bold tracking-widest text-sm"
            >
              REAL NIETZSCHE
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGuess(false)}
              className="py-4 border-2 border-[#f72585] text-[#f72585] hover:bg-[#f72585] hover:text-black transition-colors font-bold tracking-widest text-sm"
            >
              THUS SPOKE GPU
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
