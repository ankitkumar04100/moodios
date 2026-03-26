import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { MOOD_THEMES } from '@/types/emotion';
import type { Mood } from '@/types/emotion';
import { Lock, Unlock, Cpu, Sparkles } from 'lucide-react';

const moodEmojiBg: Record<Mood, string> = {
  calm: 'from-teal-500/20 to-cyan-500/10',
  focus: 'from-blue-500/20 to-indigo-500/10',
  creative: 'from-pink-500/20 to-orange-500/10',
  tired: 'from-amber-500/20 to-purple-500/10',
  motivated: 'from-red-500/20 to-yellow-500/10',
  stressed: 'from-purple-500/20 to-violet-500/10',
  overwhelmed: 'from-slate-500/20 to-blue-500/10',
  neutral: 'from-gray-500/20 to-blue-500/10',
  joyful: 'from-yellow-500/20 to-orange-500/10',
};

export default function ModesPage() {
  const { activeMood, moodOverride, setMoodOverride, emotion, sensingActive } = useEmotionStore();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-mode-primary uppercase tracking-widest font-display flex items-center gap-2">
          <Sparkles size={14} /> Emotional Modes
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-1">
          Shape Your Experience
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Each mode transforms the entire UI — colors, motion, density, and notification behavior adapt to support your current emotional state.
        </p>
      </motion.div>

      {/* Active mood hero */}
      <motion.div
        className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-mode-primary/10 via-mode-glow/5 to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br from-mode-primary/20 to-mode-glow/10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {MOOD_THEMES.find(t => t.mood === activeMood)?.icon || '🙂'}
          </motion.div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="font-display text-2xl font-bold text-foreground capitalize">
              Currently: {activeMood}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {MOOD_THEMES.find(t => t.mood === activeMood)?.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-mode-primary/10 text-mode-primary font-medium">
                Stress {Math.round(emotion.stressLevel * 100)}%
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-mode-glow/10 text-mode-glow font-medium">
                Energy {Math.round(emotion.energyLevel * 100)}%
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-mode-accent/10 text-mode-accent font-medium">
                Confidence {Math.round(emotion.confidence * 100)}%
              </span>
            </div>
          </div>
          {moodOverride && (
            <motion.div
              className="px-3 py-1.5 rounded-full bg-mode-primary/15 text-mode-primary text-xs font-medium flex items-center gap-1.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Lock size={12} /> Override Active
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Modes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOOD_THEMES.map((theme, i) => {
          const isActive = activeMood === theme.mood;
          const isOverride = moodOverride === theme.mood;
          return (
            <motion.button
              key={theme.mood}
              onClick={() => setMoodOverride(isOverride ? null : theme.mood)}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                isActive ? 'ring-2 ring-mode-primary ring-offset-2 ring-offset-background' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${moodEmojiBg[theme.mood]}`} />
              <div className="absolute inset-0 glass-subtle" />

              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 50%, hsl(var(--mode-primary) / 0.08), transparent 70%)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <span className="text-3xl mb-3 block">{theme.icon}</span>
                  {isOverride && <Lock size={14} className="text-mode-primary" />}
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{theme.label}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{theme.description}</p>

                <div className="mt-4 flex items-center gap-2">
                  {isOverride ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-mode-primary/20 text-mode-primary flex items-center gap-1">
                      <Lock size={10} /> Locked
                    </span>
                  ) : isActive ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-mode-primary/10 text-mode-primary animate-pulse">
                      ● Active
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Tap to switch
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Auto mode card */}
        <motion.button
          onClick={() => setMoodOverride(null)}
          className={`group relative overflow-hidden rounded-2xl p-6 text-left glass ${
            !moodOverride ? 'ring-2 ring-mode-primary ring-offset-2 ring-offset-background' : ''
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: MOOD_THEMES.length * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <span className="text-3xl mb-3 block"><Cpu size={28} className="text-mode-primary" /></span>
              {!moodOverride && <Unlock size={14} className="text-mode-primary" />}
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Auto</h3>
            <p className="text-sm text-muted-foreground mt-1">Let the AI decide based on your real-time signals</p>
            {!moodOverride && (
              <span className="mt-4 inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-mode-primary/10 text-mode-primary animate-pulse">
                ● Active
              </span>
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
