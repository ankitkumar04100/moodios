import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { MOOD_THEMES } from '@/types/emotion';
import { PlayCircle, Target, Sparkles, BarChart3, Activity, Zap, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

function MiniTimeline() {
  const { recentHistory } = useEmotionStore();
  const last20 = recentHistory.slice(-20);
  if (last20.length < 2) return null;

  return (
    <div className="flex items-end gap-0.5 h-12">
      {last20.map((s, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t bg-mode-primary/60"
          style={{ height: `${s.energyLevel * 100}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { emotion, activeMood, sensingActive, toggleSensing } = useEmotionStore();
  const moodTheme = MOOD_THEMES.find((m) => m.mood === activeMood) || MOOD_THEMES[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated gradient backdrop */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-mode-primary/20 via-mode-glow/10 to-transparent"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-mode-glow/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10">
          <motion.p
            className="text-sm font-medium text-mode-primary tracking-widest uppercase mb-2"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Now Playing: Your Mood
          </motion.p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
            {moodTheme.icon} {moodTheme.label}
          </h2>
          <p className="text-muted-foreground max-w-md">{moodTheme.description}</p>

          {sensingActive && (
            <motion.div
              className="mt-4 flex items-center gap-6 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-mode-primary" />
                <span className="text-muted-foreground">Stress</span>
                <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-mode-primary"
                    animate={{ width: `${emotion.stressLevel * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-foreground font-medium">{Math.round(emotion.stressLevel * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-mode-glow" />
                <span className="text-muted-foreground">Energy</span>
                <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-mode-glow"
                    animate={{ width: `${emotion.energyLevel * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-foreground font-medium">{Math.round(emotion.energyLevel * 100)}%</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {!sensingActive ? (
          <motion.button
            onClick={toggleSensing}
            className="glass rounded-xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-primary/15 flex items-center justify-center">
              <PlayCircle size={20} className="text-mode-primary" />
            </div>
            <div className="text-left">
              <p className="font-display font-semibold text-foreground">Enable Sensing</p>
              <p className="text-xs text-muted-foreground">Start emotion detection</p>
            </div>
          </motion.button>
        ) : (
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-primary/15 flex items-center justify-center">
              <Brain size={20} className="text-mode-primary animate-pulse" />
            </div>
            <div className="text-left">
              <p className="font-display font-semibold text-foreground">Sensing Active</p>
              <p className="text-xs text-muted-foreground">Confidence: {Math.round(emotion.confidence * 100)}%</p>
            </div>
          </motion.div>
        )}

        <Link to="/focus">
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform h-full"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-accent/15 flex items-center justify-center">
              <Target size={20} className="text-mode-accent" />
            </div>
            <div className="text-left">
              <p className="font-display font-semibold text-foreground">Focus Tunnel</p>
              <p className="text-xs text-muted-foreground">Enter deep work mode</p>
            </div>
          </motion.div>
        </Link>

        <Link to="/creative">
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform h-full"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-glow/15 flex items-center justify-center">
              <Sparkles size={20} className="text-mode-glow" />
            </div>
            <div className="text-left">
              <p className="font-display font-semibold text-foreground">Creative Space</p>
              <p className="text-xs text-muted-foreground">Capture your sparks</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Mini Timeline */}
      {sensingActive && (
        <motion.div
          className="glass rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-mode-primary" />
              <p className="font-display font-semibold text-sm text-foreground">Recent Activity</p>
            </div>
            <Link to="/timeline" className="text-xs text-mode-primary hover:underline">View Full Timeline →</Link>
          </div>
          <MiniTimeline />
        </motion.div>
      )}

      {/* Daily Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Energy', value: `${Math.round(emotion.energyLevel * 100)}%`, icon: Zap },
          { label: 'Stress Level', value: `${Math.round(emotion.stressLevel * 100)}%`, icon: Activity },
          { label: 'Mood', value: activeMood, icon: Brain },
          { label: 'Confidence', value: `${Math.round(emotion.confidence * 100)}%`, icon: Target },
        ].map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            className="glass rounded-xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Icon size={16} className="mx-auto mb-2 text-mode-primary" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-display font-bold text-lg text-foreground capitalize">{value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
