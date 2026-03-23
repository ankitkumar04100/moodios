import { motion } from "framer-motion";
import { useEmotionStore } from "@/stores/emotionStore";
import { Link } from "react-router-dom";
import { Zap, Brain, Activity, Target, Sparkles, PlayCircle } from "lucide-react";

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
  const { emotion, activeMood, sensingActive, toggleSensing } = useEmotionStore();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-sm text-mode-primary uppercase tracking-widest">
          MoodiOS • Emotional Engine
        </p>
        <h1 className="font-display text-4xl font-bold text-foreground capitalize">
          {activeMood}
        </h1>
        <p className="text-muted-foreground">Real-time emotional sensing.</p>
      </motion.div>

      {/* SENSING CARD */}
      <motion.div
        className="glass p-5 rounded-xl flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <p className="text-lg font-display font-semibold text-foreground">
            Emotion Sensing
          </p>
          <p className="text-muted-foreground text-sm">
            {sensingActive ? "Running…" : "Tap to activate"}
          </p>
        </div>

        <button
          onClick={toggleSensing}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            sensingActive
              ? "bg-mode-accent/20 text-mode-accent"
              : "bg-mode-primary/20 text-mode-primary"
          }`}
        >
          {sensingActive ? "Stop" : "Start"}
        </button>
      </motion.div>

      {/* LIVE METERS */}
      {sensingActive && (
        <motion.div
          className="glass p-5 rounded-xl space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Stress */}
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-mode-primary" />
            <span className="text-sm text-muted-foreground">Stress</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-mode-primary"
                animate={{ width: `${emotion.stressLevel * 100}%` }}
              />
            </div>
            <span className="text-sm text-foreground font-medium">
              {Math.round(emotion.stressLevel * 100)}%
            </span>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-mode-glow" />
            <span className="text-sm text-muted-foreground">Energy</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-mode-glow"
                animate={{ width: `${emotion.energyLevel * 100}%` }}
              />
            </div>
            <span className="text-sm text-foreground font-medium">
              {Math.round(emotion.energyLevel * 100)}%
            </span>
          </div>
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
            className="glass p-5 rounded-xl text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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

      {/* TIMELINE */}
      {sensingActive && (
        <motion.div
          className="glass p-5 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-mode-primary font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} /> Recent Activity
          </p>
          <MiniTimeline />
        </motion.div>
      )}
    </div>
  );
}
