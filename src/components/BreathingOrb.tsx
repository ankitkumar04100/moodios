import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';

interface BreathingOrbProps {
  size?: number;
  className?: string;
}

export default function BreathingOrb({ size = 200, className = '' }: BreathingOrbProps) {
  const { emotion, activeMood } = useEmotionStore();
  
  // Breathing rate adapts: higher stress = slower, deeper breaths
  const breathDuration = 4 + emotion.stressLevel * 4; // 4-8s cycle
  const scaleAmplitude = 0.15 + emotion.stressLevel * 0.1;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer glow rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full"
          style={{
            width: size - ring * 20,
            height: size - ring * 20,
            background: `radial-gradient(circle, hsl(var(--mode-primary) / ${0.08 - ring * 0.02}), transparent 70%)`,
          }}
          animate={{
            scale: [1, 1 + scaleAmplitude - ring * 0.03, 1],
            opacity: [0.3 + ring * 0.1, 0.6, 0.3 + ring * 0.1],
          }}
          transition={{
            duration: breathDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: ring * 0.3,
          }}
        />
      ))}
      
      {/* Core orb */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: `radial-gradient(circle at 35% 35%, hsl(var(--mode-glow)), hsl(var(--mode-primary)), hsl(var(--mode-accent)))`,
          boxShadow: `0 0 ${size * 0.3}px ${size * 0.1}px hsl(var(--mode-glow) / 0.3)`,
        }}
        animate={{
          scale: [1, 1 + scaleAmplitude, 1],
        }}
        transition={{
          duration: breathDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Center text */}
      <motion.div
        className="absolute flex flex-col items-center"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: breathDuration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs font-display font-medium text-primary-foreground/80 drop-shadow-lg">
          breathe
        </span>
      </motion.div>
    </div>
  );
}
