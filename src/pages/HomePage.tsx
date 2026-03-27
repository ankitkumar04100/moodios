import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEmotionStore } from "@/stores/emotionStore";
import { Zap, Brain, Activity, Target, Sparkles, PlayCircle, Shield, Camera, AlertTriangle, TrendingUp, Clock, MessageCircle } from "lucide-react";
import PermissionsSheet from "@/components/PermissionsSheet";
import BreathingOrb from "@/components/BreathingOrb";
import HeartbeatPulse from "@/components/HeartbeatPulse";
import { MOOD_THEMES } from "@/types/emotion";

function MiniTimeline() {
  const { recentHistory } = useEmotionStore();
  const last30 = recentHistory.slice(-30);
  if (last30.length < 2) return null;

  return (
    <div className="flex items-end gap-0.5 h-16">
      {last30.map((s, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm bg-gradient-to-t from-mode-primary/80 to-mode-glow/40"
          style={{ height: `${Math.max(8, s.energyLevel * 100)}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { emotion, activeMood, sensingActive, sensingMode, toggleSensing } = useEmotionStore();
  const [permOpen, setPermOpen] = useState(false);
  const moodTheme = MOOD_THEMES.find(t => t.mood === activeMood);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            <p className="text-xs text-mode-primary uppercase tracking-widest font-display flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-mode-primary animate-pulse" />
              MoodiOS • Emotional Engine
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground capitalize mt-2">
              {activeMood}
            </h1>
            <p className="text-muted-foreground mt-1.5 max-w-md">
              {sensingActive
                ? sensingMode === 'simulation'
                  ? 'Behavioral simulation active — grant camera/mic for real sensing'
                  : 'Real-time emotion sensing active'
                : 'Tap Sense to activate your emotional engine'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <HeartbeatPulse />
            {sensingActive && (
              <motion.div
                className="text-3xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {moodTheme?.icon}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reasoning Banner */}
      {sensingActive && emotion.reasoning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl glass border-mode-primary/20"
        >
          <MessageCircle size={16} className="text-mode-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-display font-semibold text-mode-primary uppercase tracking-wider">Why this mood?</p>
            <p className="text-sm text-foreground mt-1">{emotion.reasoning}</p>
            <p className="text-xs text-muted-foreground mt-1">Confidence: {Math.round(emotion.confidence * 100)}%</p>
          </div>
        </motion.div>
      )}

      {/* Simulation Banner */}
      {sensingActive && sensingMode === 'simulation' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
        >
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Simulation Mode</p>
            <p className="text-xs text-muted-foreground">Enable camera & mic for real emotion detection</p>
          </div>
          <button
            onClick={() => setPermOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-mode-primary/15 text-mode-primary hover:bg-mode-primary/25 transition-colors flex items-center gap-1"
          >
            <Camera size={12} /> Enable
          </button>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { action: toggleSensing, icon: PlayCircle, label: sensingActive ? 'Stop Sensing' : 'Start Sensing', delay: 0 },
          { to: '/focus', icon: Target, label: 'Focus Tunnel', delay: 0.05 },
          { to: '/creative', icon: Sparkles, label: 'Creative Space', delay: 0.1 },
          { to: '/shield', icon: Shield, label: 'Shield', delay: 0.15 },
        ].map((item, i) => {
          const content = (
            <motion.div
              className="glass p-4 rounded-xl text-center hover:bg-secondary/50 transition-colors cursor-pointer aura-glow"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
            >
              <item.icon size={22} className="mx-auto mb-2 text-mode-primary" />
              <p className="text-xs font-medium text-foreground">{item.label}</p>
            </motion.div>
          );
          if ('to' in item && item.to) return <Link key={i} to={item.to}>{content}</Link>;
          return <div key={i} onClick={item.action}>{content}</div>;
        })}
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Energy", value: emotion.energyLevel, icon: Zap, color: "text-mode-glow" },
          { label: "Stress", value: emotion.stressLevel, icon: Activity, color: "text-mode-primary" },
          { label: "Mood", value: activeMood, icon: Brain, color: "text-mode-accent" },
          { label: "Confidence", value: emotion.confidence, icon: Target, color: "text-mode-primary" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            className="glass p-5 rounded-xl text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Icon size={18} className={`mx-auto mb-2 ${color}`} />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-display text-xl font-bold text-foreground capitalize">
              {typeof value === "number" ? `${Math.round(value * 100)}%` : value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Breathing Orb + Stats row */}
      {sensingActive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-xs text-muted-foreground font-display mb-3">Guided Breathing</p>
            <BreathingOrb size={160} />
            <p className="text-xs text-muted-foreground mt-3">
              {emotion.stressLevel > 0.6 ? 'Slow, deep breaths...' : 'You\'re doing great'}
            </p>
          </motion.div>

          <motion.div
            className="glass p-5 rounded-2xl space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={14} className="text-mode-primary" /> Live Signals
            </h3>
            {[
              { label: 'Stress', value: emotion.stressLevel, gradient: 'from-mode-primary to-mode-accent' },
              { label: 'Energy', value: emotion.energyLevel, gradient: 'from-mode-glow to-mode-primary' },
              { label: 'Confidence', value: emotion.confidence, gradient: 'from-mode-accent to-mode-glow' },
            ].map(({ label, value, gradient }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground tabular-nums font-medium">{Math.round(value * 100)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>Updated {new Date(emotion.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mini Timeline */}
      {sensingActive && (
        <motion.div className="glass p-5 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-mode-primary font-semibold flex items-center gap-2 font-display text-sm">
              <Activity size={16} /> Recent Activity
            </p>
            <Link to="/timeline" className="text-xs text-mode-primary hover:underline">View Full →</Link>
          </div>
          <MiniTimeline />
        </motion.div>
      )}

      <PermissionsSheet open={permOpen} onOpenChange={setPermOpen} />
    </div>
  );
}
