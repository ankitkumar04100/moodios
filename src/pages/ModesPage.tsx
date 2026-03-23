import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { MOOD_THEMES } from '@/types/emotion';
import type { Mood } from '@/types/emotion';

export default function ModesPage() {
  const { activeMood, moodOverride, setMoodOverride } = useEmotionStore();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Emotional Modes</h1>
        <p className="text-muted-foreground mt-1">Each mode reshapes your entire experience. Tap to preview, double-tap to lock.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOOD_THEMES.map((theme, i) => {
          const isActive = activeMood === theme.mood;
          const isOverride = moodOverride === theme.mood;
          return (
            <motion.button
              key={theme.mood}
              onClick={() => setMoodOverride(isOverride ? null : theme.mood)}
              className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                isActive ? 'ring-2 ring-mode-primary ring-offset-2 ring-offset-background' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Mood gradient background */}
              <div className={`absolute inset-0 ${theme.className}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-mode-primary/25 via-mode-glow/15 to-transparent" />
              </div>
              <div className="absolute inset-0 glass-subtle" />

              <div className="relative z-10">
                <span className="text-3xl mb-3 block">{theme.icon}</span>
                <h3 className="font-display text-xl font-bold text-foreground">{theme.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>

                <div className="mt-4 flex items-center gap-2">
                  {isOverride ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-mode-primary/20 text-mode-primary">Locked</span>
                  ) : isActive ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-mode-primary/10 text-mode-primary">Active</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Tap to switch</span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* Auto mode card */}
        <motion.button
          onClick={() => setMoodOverride(null)}
          className={`relative overflow-hidden rounded-2xl p-6 text-left glass ${
            !moodOverride ? 'ring-2 ring-mode-primary ring-offset-2 ring-offset-background' : ''
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-3xl mb-3 block">🤖</span>
          <h3 className="font-display text-xl font-bold text-foreground">Auto</h3>
          <p className="text-sm text-muted-foreground mt-1">Let the AI decide based on your real-time signals</p>
          {!moodOverride && (
            <span className="mt-4 inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-mode-primary/10 text-mode-primary">Active</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
