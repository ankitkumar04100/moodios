import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { Heart } from 'lucide-react';

export default function HeartbeatPulse() {
  const { emotion, sensingActive } = useEmotionStore(); 
  
  if (!sensingActive) return null;

  // BPM derived from energy + stress
  const bpm = 60 + emotion.energyLevel * 40 + emotion.stressLevel * 20;
  const duration = 60 / bpm;

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle"
      animate={{ scale: [1, 1.04, 1, 1.02, 1] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Heart size={14} className="text-mode-primary fill-mode-primary/30" />
      <span className="text-xs font-display font-medium text-muted-foreground tabular-nums">
        {Math.round(bpm)} bpm
      </span>
    </motion.div>
  );
}
