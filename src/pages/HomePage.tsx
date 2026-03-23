import { motion } from "framer-motion";
import { useEmotionStore } from "@/stores/emotionStore";
import { Link } from "react-router-dom";
import { Zap, Brain, Activity, Target, Sparkles } from "lucide-react";

// 🌌 PARTICLE FIELD BACKDROP
function ParticleField() {
  const particles = Array.from({ length: 40 });

  return (
    <div className="absolute inset-0 overflow-hidden -z-10 opacity-50">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-mode-glow"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0.2,
          }}
          animate={{
            y: ["0%", "100%"],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

// 🔵 MOOD CORE (CENTER EMOTIONAL ENERGY SPHERE)
function MoodCore({ energy, stress }) {
  return (
    <div className="relative flex items-center justify-center mt-6 mb-10">
      <motion.div
        className="w-40 h-40 rounded-full blur-3xl absolute"
        animate={{
          background: [
            `rgba(0,180,255,${0.4 + energy})`,
            `rgba(255,80,120,${0.4 + stress})`,
            `rgba(0,180,255,${0.4 + energy})`,
          ],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <motion.div
        className="w-32 h-32 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 30px rgba(0,200,255,0.2)",
            "0 0 40px rgba(255,80,120,0.3)",
            "0 0 30px rgba(0,200,255,0.2)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-mode-primary/40 backdrop-blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            backgroundColor: [
              "rgba(0,150,255,0.4)",
              "rgba(255,60,90,0.4)",
              "rgba(0,150,255,0.4)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

// 📊 MINI ENERGY GRAPH
function EnergyTimeline({ history }) {
  const last20 = history.slice(-20);
  if (!last20.length) return null;

  return (
    <div className="flex items-end h-16 gap-1 mt-4">
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
  const { emotion, activeMood, sensingActive, toggleSensing, recentHistory } =
    useEmotionStore();

  return (
    <div className="relative p-6 max-w-6xl mx-auto">
      <ParticleField />

      {/* HEADER */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-mode-primary tracking-widest uppercase mb-2">
          MoodiOS • Emotional Intelligence Engine
        </p>

        <h1 className="font-display text-5xl text-foreground font-bold">
          {activeMood.charAt(0).toUpperCase() + activeMood.slice(1)}
        </h1>
      </motion.div>

      {/* MOOD CORE */}
      <MoodCore energy={emotion.energyLevel} stress={emotion.stressLevel} />

      {/* SENSING CARD */}
      <motion.div
        className="glass p-5 rounded-2xl flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="text-xl font-display font-bold text-foreground">
            Emotion Sensing
          </p>
          <p className="text-muted-foreground text-sm">
            {sensingActive ? "Running in real time…" : "Tap to activate analysis"}
          </p>
        </div>

        <motion.button
          onClick={toggleSensing}
          className={`px-5 py-2 rounded-xl text-sm font-semibold ${
            sensingActive
              ? "bg-mode-accent/20 text-mode-accent"
              : "bg-mode-primary/20 text-mode-primary"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {sensingActive ? "Stop" : "Start"}
        </motion.button>
      </motion.div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Energy", value: emotion.energyLevel, icon: Zap },
          { label: "Stress", value: emotion.stressLevel, icon: Activity },
          { label: "Focus", value: emotion.focusLevel, icon: Target },
          { label: "Confidence", value: emotion.confidence, icon: Brain },
        ].map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            className="glass p-5 rounded-2xl text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Icon className="mx-auto mb-2 text-mode-primary" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold text-foreground">
              {Math.round(value * 100)}%
            </p>
          </motion.div>
        ))}
      </div>

      {/* RECENT ACTIVITY GRAPH */}
      {sensingActive && (
        <motion.div
          className="glass p-5 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="flex items-center gap-2 text-mode-primary mb-3">
            <Sparkles size={16} /> Recent Emotional Activity
          </p>
          <EnergyTimeline history={recentHistory} />
        </motion.div>
      )}
    </div>
  );
}
