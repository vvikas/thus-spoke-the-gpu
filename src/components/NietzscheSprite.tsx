import { motion } from 'framer-motion';

export type NietzscheExpression = 'idle' | 'speaking' | 'wrong' | 'right' | 'final' | 'thinking';

interface NietzscheSpriteProps {
  expression?: NietzscheExpression;
  size?: number;
  className?: string;
}

export default function NietzscheSprite({ expression = 'idle', size = 120, className = '' }: NietzscheSpriteProps) {
  const eyeY = expression === 'right' ? 2 : expression === 'wrong' ? -2 : 0;
  const browAngle = expression === 'wrong' ? 15 : expression === 'right' ? -5 : expression === 'thinking' ? 10 : 0;
  const mouthCurve = expression === 'right' ? 'M 42 75 Q 60 85 78 75' : expression === 'wrong' ? 'M 42 80 Q 60 70 78 80' : 'M 45 77 Q 60 82 75 77';

  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={expression === 'speaking' ? { y: [0, -3, 0] } : expression === 'final' ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: expression === 'speaking' ? 0.4 : 1.5, ease: 'easeInOut' }}
    >
      <svg width={size} height={size * 1.3} viewBox="0 0 120 156" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Coat */}
        <rect x="20" y="100" width="80" height="56" rx="4" fill="#1a1a2e" />
        <rect x="20" y="100" width="35" height="56" rx="2" fill="#16213e" />
        {/* Collar */}
        <polygon points="55,100 45,120 55,115" fill="#e5e5e5" />
        <polygon points="65,100 75,120 65,115" fill="#e5e5e5" />
        {/* Shirt front */}
        <rect x="50" y="100" width="20" height="40" fill="#e5e5e5" />
        {/* Neck */}
        <rect x="50" y="88" width="20" height="16" rx="2" fill="#d4a574" />
        {/* Head */}
        <ellipse cx="60" cy="60" rx="36" ry="40" fill="#d4a574" />
        {/* Hair */}
        <ellipse cx="60" cy="24" rx="36" ry="14" fill="#2d2d2d" />
        <rect x="24" y="20" width="10" height="28" rx="5" fill="#2d2d2d" />
        <rect x="86" y="20" width="10" height="28" rx="5" fill="#2d2d2d" />
        {/* Left eyebrow */}
        <motion.line
          x1="30" y1="48" x2="52" y2="46"
          stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"
          animate={{ rotate: browAngle }}
          style={{ transformOrigin: '41px 47px' }}
        />
        {/* Right eyebrow */}
        <motion.line
          x1="68" y1="46" x2="90" y2="48"
          stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"
          animate={{ rotate: -browAngle }}
          style={{ transformOrigin: '79px 47px' }}
        />
        {/* Eyes */}
        <motion.g animate={{ y: eyeY }}>
          <ellipse cx="40" cy="58" rx="7" ry="8" fill="white" />
          <ellipse cx="80" cy="58" rx="7" ry="8" fill="white" />
          <ellipse cx={expression === 'final' ? 42 : 40} cy="58" rx="4" ry="5" fill="#1a1a1a" />
          <ellipse cx={expression === 'final' ? 82 : 80} cy="58" rx="4" ry="5" fill="#1a1a1a" />
          {/* Eye shine */}
          <circle cx="38" cy="55" r="1.5" fill="white" />
          <circle cx="78" cy="55" r="1.5" fill="white" />
        </motion.g>
        {/* Nose */}
        <ellipse cx="60" cy="68" rx="4" ry="3" fill="#c49060" />
        {/* The glorious mustache */}
        <motion.g
          animate={expression === 'speaking' ? { scaleX: [1, 1.08, 1], scaleY: [1, 0.92, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.3 }}
          style={{ transformOrigin: '60px 76px' }}
        >
          {/* Main mustache body */}
          <path d="M 25 72 Q 40 68 55 74 Q 60 76 65 74 Q 80 68 95 72 Q 80 82 65 78 Q 60 76 55 78 Q 40 82 25 72 Z" fill="#1a1a1a" />
          {/* Mustache curl left */}
          <path d="M 25 72 Q 18 68 20 62 Q 24 60 28 66" fill="#2d2d2d" />
          {/* Mustache curl right */}
          <path d="M 95 72 Q 102 68 100 62 Q 96 60 92 66" fill="#2d2d2d" />
        </motion.g>
        {/* Mouth */}
        <motion.path
          d={mouthCurve}
          stroke="#8b4513" strokeWidth="2" fill="none" strokeLinecap="round"
          animate={{ d: mouthCurve }}
          transition={{ duration: 0.3 }}
        />
        {/* Ears */}
        <ellipse cx="24" cy="60" rx="6" ry="9" fill="#c49060" />
        <ellipse cx="96" cy="60" rx="6" ry="9" fill="#c49060" />
      </svg>
    </motion.div>
  );
}
