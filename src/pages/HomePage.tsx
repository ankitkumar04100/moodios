import { motion } from "framer-motion";
import { useEmotionStore } from "@/stores/emotionStore";
import { Link } from "react-router-dom";
import {
  Zap,
  Brain,
  Activity,
  Target,
  Sparkles,
  PlayCircle,
} from "lucide-react";

function MiniTimeline() {
  const { recentHistory } = useEmotionStore();
  const last20 = recentHistory.slice(-20);
  if (last20.length < 2) return null;

  return (
    <div className="flex items-end gap-1 h-14">
      {last20.map((s, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t bg-mode-primary/60"
          style={{ height: `${s.energyLevel * 100}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.03 }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { emotion, activeMood, sensingActive, toggleSensing } =
    useEmotionStore();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-mode-primary tracking-wider uppercase">
          MoodiOS • Emotional Engine
        </p>
        <h1 className="font-display text-4xl font-bold text-foreground">
          {activeMood.charAt(0).toUpperCase() + activeMood.slice(1)}
        </h1>
        <p className="text-muted-foreground">
          Real‑time emotion sensing and adaptive UI.
        </p>
      </motion.div>

      {/* SENSING MODULE */}
      <motion.div
        className="glass rounded-xl p-5 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <p className="font-display font-semibold text-foreground text-lg">
            Emotion Sensing
          </p>
          <p className="text-muted-foreground text-sm">
            {sensingActive
              ? "Running in real time..."
              : "Tap to start emotion detection"}
          </p>
        </div>

        <motion.button
          onClick={toggleSensing}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            sensingActive
              ? "bg-mode-accent/20 text-mode-accent"
              : "bg-mode-primary/20 text-mode-primary"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {sensingActive ? "Stop" : "Start"}
        </motion.button>
      </motion.div>

      {/* LIVE BARS */}
      {sensingActive && (
        <motion.div
          className="glass rounded-xl p-5 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Stress */}
          <div className="flex items-center gap-3">
            <Activity className="text-mode-primary" size={16} />
            <p className="text-sm text-muted-foreground">Stress</p>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-mode-primary"
                animate={{ width: `${emotion.stressLevel * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-foreground text-sm font-medium">
              {Math.round(emotion.stressLevel * 100)}%
            </span>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-3">
            <Zap className="text-mode-glow" size={16} />
            <p className="text-sm text-muted-foreground">Energy</p>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-mode-glow"
                animate={{ width: `${emotion.energyLevel * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-foreground text-sm font-medium">
              {Math.round(emotion.energyLevel * 100)}%
            </span>
          </div>
        </motion.div>
      )}

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.button
          onClick={toggleSensing}
          className="glass rounded-xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform"
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-10 h-10 rounded-lg bg-mode-primary/15 flex items-center justify-center">
            <PlayCircle size={20} className="text-mode-primary" />
          </div>
          <div>
            <p className="font-display text-foreground font-semibold">
              {sensingActive ? "Sensing Active" : "Enable Sensing"}
            </p>
            <p className="text-xs text-muted-foreground">
              {sensingActive
                ? `Confidence: ${Math.round(emotion.confidence * 100)}%`
                : "Start real-time sensing"}
            </p>
          </div>
        </motion.button>

        <Link to="/focus">
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform"
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-accent/15 flex items-center justify-center">
              <Target size={20} className="text-mode-accent" />
            </div>
            <div>
              <p className="font-display text-foreground font-semibold">
                Focus Tunnel
              </p>
              <p className="text-xs text-muted-foreground">
                Enter deep work UI
              </p>
            </div>
          </motion.div>
        </Link>

        <Link to="/creative">
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform"
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-10 h-10 rounded-lg bg-mode-glow/15 flex items-center justify-center">
              <Sparkles size={20} className="text-mode-glow" />
            </div>
            <div>
              <p className="font-display text-foreground font-semibold">
                Creative Space
              </p>
              <p className="text-xs text-muted-foreground">
                Capture ideas instantly
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* TIMELINE */}
      {sensingActive && (
        <motion.div
          className="glass rounded-xl p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="flex items-center gap-2 text-mode-primary font-semibold mb-3">
            Recent Activity
          </p>
          <MiniTimeline />
        </motion.div>
      )}

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Energy", value: emotion.energyLevel, icon: Zap },
          { label: "Stress", value: emotion.stressLevel, icon: Activity },
          { label: "Mood", value: activeMood, icon: Brain },
          { label: "Confidence", value: emotion.confidence, icon: Target },
        ].map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            className="glass rounded-xl p-5 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Icon size={18} className="mx-auto mb-2 text-mode-primary" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-display text-xl text-foreground font-bold capitalize">
              {typeof value === "number"
                ? `${Math.round(value * 100)}%`
                : value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
