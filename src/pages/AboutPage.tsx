import { motion } from 'framer-motion';
import { Heart, Shield, Brain, Eye, Zap } from 'lucide-react';

const sections = [
  {
    icon: Brain,
    title: 'Emotion-Adaptive Intelligence',
    text: 'MoodiOS uses on-device AI to understand your emotional state through facial micro-expressions and voice prosody — all processed locally, never uploaded.',
  },
  {
    icon: Eye,
    title: 'Cinematic Interface',
    text: 'Every pixel responds to how you feel. Colors shift, motion adapts, and the entire experience transforms in real-time to match your emotional wavelength.',
  },
  {
    icon: Shield,
    title: 'Privacy by Design',
    text: 'Zero data leaves your device. No cloud, no servers, no tracking. Your emotions are yours alone. Always.',
  },
  {
    icon: Heart,
    title: 'Human-Centered',
    text: 'Built to reduce digital stress, protect focus, and amplify creativity. Technology that serves your wellbeing, not the other way around.',
  },
  {
    icon: Zap,
    title: 'Adaptive Performance',
    text: 'Automatically adjusts resolution, sampling rate, and visual complexity based on your device\'s capabilities. Beautiful everywhere.',
  },
];

export default function AboutPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <motion.div
        className="relative text-center py-16 overflow-hidden rounded-2xl"
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
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-mode-glow/8 blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-mode-primary to-mode-glow flex items-center justify-center mb-6"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <span className="text-3xl">🧠</span>
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">MoodiOS</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          The world's first emotion-adaptive operating system layer. Your device learns how you feel — and responds.
        </p>
        <p className="text-sm text-muted-foreground/60 mt-2">v1.0 · Built with privacy at the core</p>
      </motion.div>

      {/* Vision sections */}
      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            className="glass rounded-xl p-6 flex gap-4"
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-primary/15 flex items-center justify-center shrink-0">
              <section.icon size={20} className="text-mode-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">{section.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{section.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground py-8">
        Made with 💜 for a more empathetic digital world
      </div>
    </div>
  );
}
