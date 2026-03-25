/**
 * useRealSensing — manages real camera+mic streams and pipes them
 * to FaceLandmarker and ProsodyAnalyzer.
 * Fuses results into a single emotion vector and updates the store.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useEmotionStore } from '@/stores/emotionStore';
import { ProsodyAnalyzer, type ProsodyFeatures } from '@/core/audio/prosodyAnalyzer';
import { FaceLandmarkerEngine, type FaceFeatures } from '@/core/vision/faceLandmarker';
import { adaptivePolicy, perfBudgeter } from '@/lib/adaptive';
import { pushSample } from '@/lib/duckdb';
import type { Mood } from '@/types/emotion';

function fuseToEmotion(
  face: FaceFeatures | null,
  audio: ProsodyFeatures | null
): { mood: Mood; stress: number; energy: number; confidence: number } {
  // Default from face
  const browStress = face ? face.browTension : 0;
  const lipStress = face ? face.lipCompression : 0;
  const eyeOpen = face ? face.eyeOpenness : 0.5;
  const smile = face ? face.mouthSmile : 0;
  const attention = face ? face.attention : 0.5;

  // Audio features
  const rms = audio ? audio.rmsEnergy : 0;
  const centroid = audio ? audio.spectralCentroid : 0;
  const rhythm = audio ? audio.rhythmicity : 0;

  // Fusion weights
  const stress = browStress * 0.3 + lipStress * 0.2 + (1 - smile) * 0.15 + (1 - rhythm) * 0.1 + centroid * 0.1 + (1 - eyeOpen) * 0.15;
  const energy = rms * 0.35 + eyeOpen * 0.25 + centroid * 0.15 + rhythm * 0.15 + (face?.jawOpen ?? 0) * 0.1;
  const confidence = attention * 0.4 + (face ? 0.4 : 0) + (audio ? 0.2 : 0); // higher if both sensors active

  // Mood derivation
  let mood: Mood = 'neutral';
  if (stress > 0.6) mood = 'calm'; // high stress → prescribe calm
  else if (energy < 0.3) mood = 'tired';
  else if (energy > 0.65 && confidence > 0.5) mood = 'motivated';
  else if (stress < 0.3 && energy > 0.45) mood = 'creative';
  else if (attention > 0.6) mood = 'focus';

  return {
    mood,
    stress: Math.max(0, Math.min(1, stress)),
    energy: Math.max(0, Math.min(1, energy)),
    confidence: Math.max(0, Math.min(1, confidence)),
  };
}

export function useRealSensing() {
  const { sensingActive, sensingMode, setEmotion, addToHistory, moodOverride, setShieldActive, setSensingMode } = useEmotionStore();
  const prosodyRef = useRef<ProsodyAnalyzer | null>(null);
  const faceRef = useRef<FaceLandmarkerEngine | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const latestFaceRef = useRef<FaceFeatures | null>(null);

  const startReal = useCallback(async () => {
    try {
      const resolution = perfBudgeter.cameraResolution;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: resolution }, height: { ideal: resolution } },
        audio: true,
      });
      streamRef.current = stream;

      // Init prosody
      const prosody = new ProsodyAnalyzer();
      await prosody.init(stream);
      prosodyRef.current = prosody;

      // Init face landmarker
      const face = new FaceLandmarkerEngine();
      await face.init(stream, (features) => {
        latestFaceRef.current = features;
      });
      faceRef.current = face;

      setSensingMode('real');

      // Polling loop for fusion
      const cadence = perfBudgeter.sensingCadence;
      intervalRef.current = window.setInterval(() => {
        const audioFeatures = prosodyRef.current?.extract() ?? null;
        const faceFeatures = latestFaceRef.current;

        const fused = fuseToEmotion(faceFeatures, audioFeatures);

        adaptivePolicy.update(fused.stress, fused.energy, fused.confidence);

        if (adaptivePolicy.shouldShield) {
          setShieldActive(true);
        }

        const emotionState = {
          mood: moodOverride || fused.mood,
          confidence: fused.confidence,
          stressLevel: fused.stress,
          energyLevel: fused.energy,
          lastUpdated: Date.now(),
        };

        setEmotion(emotionState);
        addToHistory(emotionState);

        // Push to DuckDB
        pushSample(
          emotionState.mood,
          emotionState.stressLevel,
          emotionState.energyLevel,
          emotionState.confidence,
          'real'
        );
      }, cadence);
    } catch (err) {
      console.warn('Real sensing failed, falling back to simulation:', err);
      setSensingMode('simulation');
    }
  }, [setEmotion, addToHistory, moodOverride, setShieldActive, setSensingMode]);

  const stopReal = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    prosodyRef.current?.destroy();
    prosodyRef.current = null;
    faceRef.current?.destroy();
    faceRef.current = null;
    latestFaceRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (sensingActive && sensingMode === 'real') {
      startReal();
    }
    return () => {
      stopReal();
    };
  }, [sensingActive, sensingMode, startReal, stopReal]);

  return { startReal, stopReal };
}
