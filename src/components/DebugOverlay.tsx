import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { Bug, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { emotion, activeMood, sensingActive, sensingMode, recentHistory } = useEmotionStore();

  if (!sensingActive) return null;

  const lastEntry = recentHistory[recentHistory.length - 1];
  const prevEntry = recentHistory[recentHistory.length - 2];
  const stressDelta = lastEntry && prevEntry ? lastEntry.stressLevel - prevEntry.stressLevel : 0;
  const energyDelta = lastEntry && prevEntry ? lastEntry.energyLevel - prevEntry.energyLevel : 0;

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-3 z-50 w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Bug size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-32 right-3 z-50 w-72 glass rounded-2xl overflow-hidden text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${sensingMode === 'real' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="font-display font-semibold text-foreground text-xs uppercase tracking-wider">
                  {sensingMode === 'real' ? 'Real Sensing' : 'Simulation'}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setExpanded(!expanded)} className="p-1 text-muted-foreground hover:text-foreground">
                  {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                </button>
                <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Live Values */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Mood</span>
                <span className="font-display font-bold text-mode-primary capitalize">{activeMood}</span>
              </div>

              {/* Gauges */}
              {[
                { label: 'Stress', value: emotion.stressLevel, delta: stressDelta, color: 'hsl(0, 75%, 55%)' },
                { label: 'Energy', value: emotion.energyLevel, delta: energyDelta, color: 'hsl(200, 80%, 55%)' },
                { label: 'Confidence', value: emotion.confidence, delta: 0, color: 'hsl(var(--mode-primary))' },
              ].map((g) => (
                <div key={g.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{g.label}</span>
                    <span className="font-mono text-foreground tabular-nums">
                      {(g.value * 100).toFixed(1)}%
                      {g.delta !== 0 && (
                        <span className={g.delta > 0 ? 'text-red-400 ml-1' : 'text-green-400 ml-1'}>
                          {g.delta > 0 ? '↑' : '↓'}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: g.color }}
                      animate={{ width: `${g.value * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded: Fusion Weights & Prosody */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 border-t border-border/50 space-y-2">
                    <p className="font-display font-semibold text-foreground uppercase tracking-wider text-[10px]">Fusion Weights</p>
                    {sensingMode === 'real' ? (
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: 'Face → Stress', w: '30%' },
                          { label: 'Lip → Stress', w: '20%' },
                          { label: 'Smile → Stress', w: '15%' },
                          { label: 'Rhythm → Stress', w: '10%' },
                          { label: 'RMS → Energy', w: '35%' },
                          { label: 'EyeOpen → Energy', w: '25%' },
                        ].map((fw) => (
                          <div key={fw.label} className="flex justify-between text-muted-foreground">
                            <span className="truncate">{fw.label}</span>
                            <span className="font-mono text-foreground">{fw.w}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5 text-muted-foreground">
                        <div className="flex justify-between"><span>Circadian</span><span className="font-mono text-foreground">sinusoidal</span></div>
                        <div className="flex justify-between"><span>Noise</span><span className="font-mono text-foreground">multi-freq</span></div>
                        <div className="flex justify-between"><span>Drift</span><span className="font-mono text-foreground">EMA 30s</span></div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-border/50">
                    <p className="font-display font-semibold text-foreground uppercase tracking-wider text-[10px] mb-2">Session Stats</p>
                    <div className="grid grid-cols-2 gap-1.5 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Samples</span>
                        <span className="font-mono text-foreground">{recentHistory.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime</span>
                        <span className="font-mono text-foreground">
                          {recentHistory.length > 0
                            ? `${Math.round((Date.now() - recentHistory[0].lastUpdated) / 1000)}s`
                            : '0s'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
