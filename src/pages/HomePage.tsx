import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEmotionStore } from "@/stores/emotionStore";
import { Zap, Brain, Activity, Target, Sparkles, PlayCircle, Shield, Camera, AlertTriangle } from "lucide-react";
import PermissionsSheet from "@/components/PermissionsSheet";

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
  const { emotion, activeMood, sensingActive, sensingMode, toggleSensing } = useEmotionStore();
  const [permOpen, setPermOpen] = useState(false);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        <p className="text-sm text-mode-primary uppercase tracking-widest font-display">
          MoodiOS • Emotional Engine
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground capitalize mt-1">
          {activeMood}
        </h1>
        <p className="text-muted-foreground mt-1">
          {sensingActive
            ? sensingMode === 'simulation'
              ? 'Simulation active — grant camera/mic for real sensing'
              : 'Real-time emotion sensing active'
            : 'Tap Sense to activate your emotional engine'}
        </p>
      </motion.div>

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
        <motion.button
          onClick={toggleSensing}
          className="glass p-4 rounded-xl text-center hover:bg-secondary/50 transition-colors"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PlayCircle size={22} className="mx-auto mb-2 text-mode-primary" />
          <p className="text-xs font-medium text-foreground">{sensingActive ? 'Stop' : 'Start'} Sensing</p>
        </motion.button>

        <Link to="/focus">
          <motion.div
            className="glass p-4 rounded-xl text-center hover:bg-secondary/50 transition-colors"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Target size={22} className="mx-auto mb-2 text-mode-glow" />
            <p className="text-xs font-medium text-foreground">Focus Tunnel</p>
          </motion.div>
        </Link>

        <Link to="/creative">
          <motion.div
            className="glass p-4 rounded-xl text-center hover:bg-secondary/50 transition-colors"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles size={22} className="mx-auto mb-2 text-mode-accent" />
            <p className="text-xs font-medium text-foreground">Creative Space</p>
          </motion.div>
        </Link>

        <Link to="/shield">
          <motion.div
            className="glass p-4 rounded-xl text-center hover:bg-secondary/50 transition-colors"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Shield size={22} className="mx-auto mb-2 text-mode-primary" />
            <p className="text-xs font-medium text-foreground">Shield</p>
          </motion.div>
        </Link>
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

      {/* Stress/Energy bars */}
      {sensingActive && (
        <motion.div
          className="glass p-5 rounded-xl space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-mode-primary" />
            <span className="text-sm text-muted-foreground w-14">Stress</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full bg-mode-primary" animate={{ width: `${emotion.stressLevel * 100}%` }} />
            </div>
            <span className="text-sm text-foreground tabular-nums w-10 text-right">{Math.round(emotion.stressLevel * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-mode-glow" />
            <span className="text-sm text-muted-foreground w-14">Energy</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full bg-mode-glow" animate={{ width: `${emotion.energyLevel * 100}%` }} />
            </div>
            <span className="text-sm text-foreground tabular-nums w-10 text-right">{Math.round(emotion.energyLevel * 100)}%</span>
          </div>
        </motion.div>
      )}

      {/* Mini Timeline */}
      {sensingActive && (
        <motion.div className="glass p-5 rounded-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-mode-primary font-semibold mb-3 flex items-center gap-2 font-display text-sm">
            <Sparkles size={16} /> Recent Activity
          </p>
          <MiniTimeline />
        </motion.div>
      )}

      <PermissionsSheet open={permOpen} onOpenChange={setPermOpen} />
    </div>
  );
}
