import { motion } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';

export default function ProgressBar() {
  const totalCompleted = useProgressStore((s) => s.totalCompleted());
  const pct = (totalCompleted / 8) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#2a2a2a] px-6 py-3 flex items-center gap-4">
      <span className="text-xs font-mono text-[#f5c518] tracking-widest shrink-0">
        {totalCompleted}/8 COMPLETE
      </span>
      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#f5c518] rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ boxShadow: pct > 0 ? '0 0 10px rgba(245,197,24,0.6)' : 'none' }}
        />
      </div>
      {totalCompleted === 8 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs font-mono text-[#f5c518] tracking-widest shrink-0"
        >
          ★ COMPLETE ★
        </motion.span>
      )}
    </div>
  );
}
