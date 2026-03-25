import { useEffect, useRef, useCallback } from 'react';
import { useEmotionStore } from '@/stores/emotionStore';
import { adaptivePolicy, perfBudgeter } from '@/lib/adaptive';
import { pushSample, flushBatch } from '@/lib/duckdb';
import type { Mood } from '@/types/emotion';

// Simulated emotion engine — produces organic emotion data
function simulateEmotion(time: number): { mood: Mood; stress: number; energy: number; confidence: number } {
  const hour = new Date().getHours();
  const timeBase = time / 1000;

  // Circadian rhythm influence
  const circadian = Math.sin((hour - 6) * Math.PI / 12);
  const baseEnergy = 0.5 + circadian * 0.25;
  const baseStress = 0.3 + Math.sin(timeBase * 0.05) * 0.15;

  // Organic noise
  const noise1 = Math.sin(timeBase * 0.3) * 0.1 + Math.sin(timeBase * 0.7) * 0.05;
  const noise2 = Math.cos(timeBase * 0.2) * 0.08 + Math.cos(timeBase * 0.5) * 0.06;

  const energy = Math.max(0, Math.min(1, baseEnergy + noise1));
  const stress = Math.max(0, Math.min(1, baseStress + noise2));
  const confidence = 0.5 + Math.sin(timeBase * 0.1) * 0.3;

  let mood: Mood = 'neutral';
  if (stress > 0.65) mood = 'calm';
  else if (energy < 0.35) mood = 'tired';
  else if (energy > 0.65 && confidence > 0.5) mood = 'motivated';
  else if (stress < 0.35 && energy > 0.45) mood = 'creative';
  else if (confidence > 0.55) mood = 'focus';

  return { mood, stress, energy, confidence: Math.max(0, Math.min(1, confidence)) };
}

export function useEmotionSensing() {
  const { sensingActive, sensingMode, setEmotion, addToHistory, moodOverride, setShieldActive } = useEmotionStore();
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());

  const tick = useCallback(() => {
    // Only run simulation tick when in simulation mode
    if (sensingMode === 'real') return;

    const elapsed = Date.now() - startTimeRef.current;
    const sim = simulateEmotion(elapsed);

    adaptivePolicy.update(sim.stress, sim.energy, sim.confidence);

    if (adaptivePolicy.shouldShield) {
      setShieldActive(true);
    }

    const emotionState = {
      mood: moodOverride || sim.mood,
      confidence: sim.confidence,
      stressLevel: sim.stress,
      energyLevel: sim.energy,
      lastUpdated: Date.now(),
    };

    setEmotion(emotionState);
    addToHistory(emotionState);

    // Push to DuckDB for persistent analytics
    pushSample(
      emotionState.mood,
      emotionState.stressLevel,
      emotionState.energyLevel,
      emotionState.confidence,
      'simulation'
    );
  }, [sensingMode, setEmotion, addToHistory, moodOverride, setShieldActive]);

  useEffect(() => {
    if (sensingActive && sensingMode !== 'real') {
      startTimeRef.current = Date.now();
      tick();
      const cadence = perfBudgeter.sensingCadence;
      intervalRef.current = window.setInterval(tick, cadence);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Flush any pending DuckDB samples
      flushBatch();
    };
  }, [sensingActive, sensingMode, tick]);
}
