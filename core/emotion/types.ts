export interface FaceFeatures {
  browTension: number;
  eyeOpenness: number;
  lipCompression: number;
  microExpressionIntensity: number;
  attention: number;
}

export interface VoiceFeatures {
  mfcc: number[];
  pitch: number;
  jitter: number;
  shimmer: number;
  energy: number;
  speechRate: number;
}

export interface TypingFeatures {
  averageFlightTime: number;
  averageHoldTime: number;
  burstiness: number;
  pauseFrequency: number;
}

export interface ContextFeatures {
  appSwitchRate: number;
  idleTime: number;
  scrollSpeed: number;
  pointerJitter: number;
}

export interface EmotionVector {
  stressLevel: number;
  energyLevel: number;
  calmness: number;
  focusLevel: number;
  confidence: number;
  activeMood: MoodType;
}

export type MoodType =
  | "focus"
  | "stressed"
  | "calm"
  | "tired"
  | "creative";

export interface FusionInput {
  face: FaceFeatures;
  voice: VoiceFeatures;
  typing: TypingFeatures;
  context: ContextFeatures;
}
