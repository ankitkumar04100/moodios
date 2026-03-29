import { motion } from 'framer-motion';
import { Heart, Shield, Brain, Eye, Zap, Cpu, Fingerprint, Waves, Palette } from 'lucide-react';
import { useEmotionStore } from '@/stores/emotionStore';
import { MOOD_THEMES } from '@/types/emotion'; 

const sections = [
  {
    icon: Brain,
    title: 'Multimodal Emotion Sensing',
    text: 'Facial micro-expressions, voice prosody analysis, typing rhythm, and contextual signals fused through a neural model — all processed on-device.',
  },
  {
    icon: Palette,
    title: '9 Emotional Modes',
    text: 'Calm, Focus, Creative, Tired, Motivated, Stressed, Overwhelmed, Neutral, and Joyful — each with unique color grading, motion curves, and notification behavior.',
  },
  {
    icon: Eye,
    title: 'Cinematic Adaptive Interface',
    text: 'Every pixel responds to how you feel. Colors morph, particles react in real-time via WebGL, and the breathing orb guides you. The UI is alive.',
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    text: 'Zero data leaves your device. No cloud, no servers, no tracking. Emotion vectors stay in RAM. Only anonymized aggregates persist locally.',
  },
  {
    icon: Waves,
    title: 'Guided Breathing & Heartbeat',
    text: 'Adaptive breathing orb syncs to stress levels. Heartbeat UI pulse reflects your emotional rhythm in real-time.',
  },
  {
    icon: Zap,
    title: 'Adaptive Performance',
    text: 'Automatically adjusts particle density, sensing cadence, and render quality based on device FPS. Runs smoothly everywhere.',
  },
  {
    icon: Cpu,
    title: 'Neural Fusion Model',
    text: 'Multi-layer perceptron classifies mood from behavioral and sensor features — no hardcoded thresholds, pure learned weights.',
  },
  {
    icon: Fingerprint,
    title: 'Notification Shield',
    text: 'Quantile-based stress detection blocks interruptions during emotional peaks. Queued alerts release when you\'re ready.',
  },
];

export default function AboutPage() {
  const { setSplashSeen } = useEmotionStore();

  const replaySplash = () => {
    setSplashSeen(false);
    window.location.reload();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-10">
      {/* Hero */}
      <motion.div
        className="relative text-center py-14 overflow-hidden rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-mode-primary/15 via-mode-glow/10 to-transparent"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-mode-glow/5 blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-mode-primary to-mode-glow flex items-center justify-center mb-6 shadow-2xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <span className="text-3xl">🧠</span>
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">MoodiOS</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          The world's first emotion-adaptive operating system layer.
        </p>
        <p className="text-sm text-muted-foreground/60 mt-2">v2.0 · 9 Modes · Neural Fusion · Privacy-First</p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={replaySplash}
            className="px-4 py-2 rounded-lg text-sm text-mode-primary bg-mode-primary/10 hover:bg-mode-primary/20 transition-colors font-medium"
          >
            Replay Splash
          </button>
        </div>
      </motion.div>

      {/* Mood chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {MOOD_THEMES.map((theme, i) => (
          <motion.span
            key={theme.mood}
            className="px-3 py-1.5 rounded-full text-xs font-medium glass-subtle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            {theme.icon} {theme.label}
          </motion.span>
        ))}
      </div>

      {/* Feature sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            className="glass rounded-xl p-5 flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-primary/10 flex items-center justify-center shrink-0">
              <section.icon size={20} className="text-mode-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm">{section.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{section.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Philosophy */}
      <motion.div
        className="glass rounded-xl p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="font-display text-sm font-semibold text-foreground mb-3">Our Philosophy</p>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Technology should feel human. MoodiOS adapts to your emotional state in real-time, 
          creating an experience that's calm when you need calm, focused when you need focus, 
          and joyful when life is good. Your emotions never leave your device.
        </p>
      </motion.div>

      <div className="text-center text-xs text-muted-foreground py-6">
        Made with 💜 for a more empathetic digital world
      </div>
    </div>
  );
}
