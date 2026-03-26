import { motion, AnimatePresence } from 'framer-motion';

interface UnlockAnimationProps {
  show: boolean;
  message: string;
  color?: string;
  onComplete?: () => void;
}

export default function UnlockAnimation({ show, message, color = '#f5c518', onComplete }: UnlockAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center px-12 py-10 border-2 max-w-lg"
            style={{ borderColor: color, boxShadow: `0 0 60px ${color}40, 0 0 120px ${color}20` }}
          >
            {/* Lock breaking animation */}
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-6xl mb-6"
            >
              🔓
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="h-px mb-6"
              style={{ backgroundColor: color }}
            />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl font-mono italic"
              style={{ color }}
            >
              "{message}"
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="h-px mt-6 mb-6"
              style={{ backgroundColor: color }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1 }}
              className="text-xs font-mono text-gray-500"
            >
              click to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
