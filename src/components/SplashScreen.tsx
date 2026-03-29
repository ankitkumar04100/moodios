import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';

export default function SplashScreen() {
  const { splashSeen, setSplashSeen } = useEmotionStore(); 
  const [show, setShow] = useState(!splashSeen);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => {
      setShow(false);
      setSplashSeen(true);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show, setSplashSeen]);

  const skip = () => {
    setShow(false);
    setSplashSeen(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(200, 80%, 55%, 0.15), transparent 70%)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-mode-primary to-mode-glow flex items-center justify-center shadow-2xl mb-8"
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              🧠
            </motion.span>
          </motion.div>

          {/* Title */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.h1
                className="font-display text-5xl sm:text-6xl font-bold text-foreground tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Moodi
                <span className="bg-gradient-to-r from-mode-primary to-mode-glow bg-clip-text text-transparent">
                  OS
                </span>
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase >= 2 && (
              <motion.p
                className="text-muted-foreground text-sm mt-3 font-body tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                Your Emotion-Adaptive Operating System
              </motion.p>
            )}
          </AnimatePresence>

          {/* Skip */}
          <motion.button
            onClick={skip}
            className="absolute bottom-8 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Skip →
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
