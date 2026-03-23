import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { Target, Play, Pause, RotateCcw, Maximize, Minimize, Clock, Zap } from 'lucide-react';

export default function FocusPage() {
  const { emotion } = useEmotionStore();
  const [duration, setDuration] = useState(25 * 60); // seconds
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const intervalRef = useRef<number | null>(null);

  const progress = 1 - remaining / duration;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch { /* graceful */ }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
      intervalRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 0) {
            setIsRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseWakeLock();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseWakeLock();
    };
  }, [isRunning, requestWakeLock, releaseWakeLock]);

  // Re-acquire wake lock on visibility change
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && isRunning) requestWakeLock();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isRunning, requestWakeLock]);

  const reset = () => {
    setIsRunning(false);
    setRemaining(duration);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const flowScore = Math.min(1, (1 - emotion.stressLevel) * emotion.energyLevel * 1.5);

  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 ${isFullscreen ? 'flex flex-col items-center justify-center min-h-screen' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Focus Tunnel</h1>
          <p className="text-muted-foreground mt-1">Deep work environment with wake lock protection.</p>
        </div>
        <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground">
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {/* Timer */}
      <motion.div
        className="glass rounded-2xl p-10 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Circular progress */}
        <div className="relative w-56 h-56 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none"
              stroke="hsl(var(--mode-primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - progress) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-5xl font-bold text-foreground tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground mt-1">{Math.round(progress * 100)}% complete</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="p-3 rounded-xl bg-secondary text-foreground hover:bg-secondary/80">
            <RotateCcw size={20} />
          </button>
          <motion.button
            onClick={() => setIsRunning(!isRunning)}
            className="p-4 rounded-xl bg-mode-primary text-primary-foreground hover:opacity-90"
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>
        </div>

        {/* Duration presets */}
        <div className="flex gap-2 mt-6">
          {[15, 25, 50].map((m) => (
            <button
              key={m}
              onClick={() => { setDuration(m * 60); setRemaining(m * 60); setIsRunning(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                duration === m * 60 ? 'bg-mode-primary/15 text-mode-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock size={12} className="inline mr-1" />{m}m
            </button>
          ))}
        </div>
      </motion.div>

      {/* Flow indicator */}
      <motion.div className="glass rounded-xl p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-mode-glow" />
          <span className="font-display font-semibold text-sm text-foreground">Flow State</span>
        </div>
        <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-mode-primary to-mode-glow"
            animate={{ width: `${flowScore * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {flowScore > 0.7 ? '🌊 Deep flow — you\'re in the zone!' :
           flowScore > 0.4 ? '🔄 Building momentum...' :
           '💫 Warming up — give it a moment'}
        </p>
      </motion.div>
    </div>
  );
}
