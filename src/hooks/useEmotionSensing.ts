import { useEffect, useRef, useCallback } from 'react';
import { useEmotionStore } from '@/stores/emotionStore';
import { adaptivePolicy, perfBudgeter } from '@/lib/adaptive'; 
import { pushSample, flushBatch } from '@/lib/duckdb';
import type { Mood } from '@/types/emotion';

/**
 * Behavioral Emotion Engine — NO randomness.
 * Tracks simulated user behaviors (typing speed, click rate, scroll velocity, 
 * time-of-day, session length) and infers emotion deterministically.
 */

interface BehavioralState {
  typingSpeed: number;       // 0-1 (slow to fast)
  typingPauses: number;      // 0-1 (few to many)
  clickRate: number;         // 0-1
  scrollVelocity: number;    // 0-1
  modeSwitchRate: number;    // 0-1
  sessionMinutes: number;
  idleSeconds: number;
  engagementLevel: number;   // 0-1
}

function getTimeInfluence(): { fatigueBias: number; energyBias: number } {
  const hour = new Date().getHours();
  // Morning peak 9-11, afternoon dip 14-16, evening wind-down 20+
  if (hour >= 6 && hour < 9) return { fatigueBias: 0.15, energyBias: 0.6 };
  if (hour >= 9 && hour < 12) return { fatigueBias: 0.05, energyBias: 0.85 };
  if (hour >= 12 && hour < 14) return { fatigueBias: 0.2, energyBias: 0.6 };
  if (hour >= 14 && hour < 17) return { fatigueBias: 0.25, energyBias: 0.55 };
  if (hour >= 17 && hour < 20) return { fatigueBias: 0.15, energyBias: 0.65 };
  if (hour >= 20 && hour < 23) return { fatigueBias: 0.4, energyBias: 0.35 };
  return { fatigueBias: 0.5, energyBias: 0.2 }; // late night
}

function simulateBehavior(elapsed: number, sessionMinutes: number): BehavioralState {
  const t = elapsed / 1000;
  const timeInfluence = getTimeInfluence();
  
  // Deterministic behavioral patterns based on session phase
  const sessionPhase = Math.min(1, sessionMinutes / 60); // 0-1 over first hour
  
  // Typing speed follows work phases: ramp up → plateau → slow down
  const typingCurve = sessionPhase < 0.2 
    ? 0.3 + sessionPhase * 2.5  // warming up
    : sessionPhase < 0.6
    ? 0.8 - (sessionPhase - 0.2) * 0.2 // productive plateau, slight decline
    : 0.72 - (sessionPhase - 0.6) * 1.2; // fatigue decline
  
  const typingSpeed = Math.max(0.1, Math.min(1, typingCurve + Math.sin(t * 0.02) * 0.08));
  
  // Pauses increase with session length and time-of-day fatigue
  const typingPauses = Math.min(1, 0.15 + sessionPhase * 0.3 + timeInfluence.fatigueBias * 0.2 + Math.sin(t * 0.015) * 0.05);
  
  // Click rate: moderate normally, spikes during productive bursts
  const clickRate = Math.max(0.1, Math.min(1, 
    0.4 + Math.sin(t * 0.008) * 0.2 + (1 - sessionPhase) * 0.15
  ));
  
  // Scroll velocity: higher during content consumption, lower during deep work
  const scrollVelocity = Math.max(0, Math.min(1,
    0.3 + Math.sin(t * 0.012) * 0.15 + timeInfluence.fatigueBias * 0.1
  ));
  
  // Mode switch rate: low during focus, can spike during stress
  const modeSwitchRate = Math.max(0, Math.min(1,
    0.1 + Math.sin(t * 0.005) * 0.1
  ));
  
  // Idle time fluctuates
  const idleSeconds = Math.max(0, 5 + Math.sin(t * 0.01) * 10 + sessionPhase * 15);
  
  // Engagement: high during productive hours, drops with fatigue
  const engagementLevel = Math.max(0.1, Math.min(1,
    timeInfluence.energyBias * 0.7 + (1 - sessionPhase) * 0.3 + Math.sin(t * 0.006) * 0.1
  ));
  
  return {
    typingSpeed,
    typingPauses,
    clickRate,
    scrollVelocity,
    modeSwitchRate,
    sessionMinutes,
    idleSeconds,
    engagementLevel,
  };
}

function inferEmotion(b: BehavioralState): { mood: Mood; stress: number; energy: number; confidence: number; reasoning: string } {
  const timeInfluence = getTimeInfluence();
  
  // Stress computation — deterministic, multi-factor
  let stress = 0;
  const stressFactors: string[] = [];
  
  if (b.typingSpeed > 0.75 && b.modeSwitchRate > 0.3) {
    stress += 0.35;
    stressFactors.push('rapid typing + mode switching');
  }
  if (b.clickRate > 0.7) {
    stress += 0.15;
    stressFactors.push('high click rate');
  }
  if (b.scrollVelocity > 0.6) {
    stress += 0.1;
    stressFactors.push('fast scrolling');
  }
  if (b.sessionMinutes > 45) {
    stress += Math.min(0.2, (b.sessionMinutes - 45) * 0.005);
    stressFactors.push('long session');
  }
  stress = Math.max(0, Math.min(1, stress + timeInfluence.fatigueBias * 0.15));
  
  // Energy computation
  let energy = timeInfluence.energyBias;
  const energyFactors: string[] = [];
  
  if (b.typingSpeed > 0.6) {
    energy = Math.min(1, energy + 0.15);
    energyFactors.push('active typing');
  }
  if (b.idleSeconds > 20) {
    energy = Math.max(0, energy - 0.2);
    energyFactors.push('extended idle');
  }
  if (b.engagementLevel > 0.7) {
    energy = Math.min(1, energy + 0.1);
    energyFactors.push('high engagement');
  }
  if (b.sessionMinutes > 50) {
    energy = Math.max(0, energy - (b.sessionMinutes - 50) * 0.008);
    energyFactors.push('session fatigue');
  }
  energy = Math.max(0, Math.min(1, energy));
  
  // Confidence — higher when signals are consistent
  const signalConsistency = 1 - Math.abs(b.typingSpeed - b.engagementLevel);
  const confidence = Math.max(0.3, Math.min(0.95, 0.5 + signalConsistency * 0.3 + Math.min(b.sessionMinutes, 10) * 0.015));
  
  // Mood classification — deterministic rules
  let mood: Mood = 'neutral';
  let reason = '';
  
  if (stress > 0.85) {
    mood = 'overwhelmed';
    reason = `Very high stress (${stressFactors.join(', ')}) with sustained pressure.`;
  } else if (stress > 0.65) {
    mood = 'stressed';
    reason = `Elevated stress from ${stressFactors.join(', ')}.`;
  } else if (energy < 0.25) {
    mood = 'tired';
    reason = `Low energy due to ${energyFactors.join(', ')}. Time influence: ${timeInfluence.fatigueBias > 0.3 ? 'late hours' : 'session length'}.`;
  } else if (energy > 0.8 && confidence > 0.7 && stress < 0.3) {
    mood = 'joyful';
    reason = `High energy + confidence with low stress. Peak productive state.`;
  } else if (energy > 0.65 && b.engagementLevel > 0.6 && stress < 0.4) {
    mood = 'motivated';
    reason = `Strong engagement (${energyFactors.join(', ')}) driving momentum.`;
  } else if (stress < 0.3 && energy > 0.45 && b.typingSpeed > 0.5) {
    mood = 'creative';
    reason = `Relaxed state with active output — creative flow detected.`;
  } else if (b.idleSeconds < 10 && b.typingSpeed > 0.4 && confidence > 0.5) {
    mood = 'focus';
    reason = `Sustained attention, minimal idle time, consistent typing rhythm.`;
  } else if (stress > 0.4 && energy > 0.4) {
    mood = 'calm';
    reason = `Moderate activity with balanced signals — de-escalation pattern.`;
  } else {
    reason = `Balanced behavioral signals, no strong emotional indicators.`;
  }
  
  return { mood, stress, energy, confidence, reasoning: reason };
}

export function useEmotionSensing() {
  const { sensingActive, sensingMode, setEmotion, addToHistory, moodOverride, setShieldActive, setVoicePrompt, voicePrompt } = useEmotionStore();
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());
  const lastVoicePromptRef = useRef(0);

  const tick = useCallback(() => {
    if (sensingMode === 'real') return;

    const elapsed = Date.now() - startTimeRef.current;
    const sessionMinutes = elapsed / 60000;
    const behavior = simulateBehavior(elapsed, sessionMinutes);
    const result = inferEmotion(behavior);

    adaptivePolicy.update(result.stress, result.energy, result.confidence);

    if (adaptivePolicy.shouldShield) {
      setShieldActive(true);
    }

    // Voice assistant logic — only trigger every 30s max
    const now = Date.now();
    if (now - lastVoicePromptRef.current > 30000) {
      if (result.stress > 0.65 && result.mood === 'stressed') {
        setVoicePrompt({
          message: "You seem stressed. Should I start Calm Mode?",
          action: 'calm',
          mood: 'stressed',
        });
        lastVoicePromptRef.current = now;
      } else if (result.energy < 0.25 && result.mood === 'tired') {
        setVoicePrompt({
          message: "You look tired. How about a short break?",
          action: 'tired',
          mood: 'tired',
        });
        lastVoicePromptRef.current = now;
      } else if (result.stress > 0.85) {
        setVoicePrompt({
          message: "High stress detected. Activating safety layer.",
          action: 'overwhelmed',
          mood: 'overwhelmed',
        });
        lastVoicePromptRef.current = now;
      }
    }

    const emotionState = {
      mood: moodOverride || result.mood,
      confidence: result.confidence,
      stressLevel: result.stress,
      energyLevel: result.energy,
      lastUpdated: Date.now(),
      reasoning: result.reasoning,
    };

    setEmotion(emotionState);
    addToHistory(emotionState);

    pushSample(
      emotionState.mood,
      emotionState.stressLevel,
      emotionState.energyLevel,
      emotionState.confidence,
      'simulation'
    );
  }, [sensingMode, setEmotion, addToHistory, moodOverride, setShieldActive, setVoicePrompt]);

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
      flushBatch();
    };
  }, [sensingActive, sensingMode, tick]);
}
