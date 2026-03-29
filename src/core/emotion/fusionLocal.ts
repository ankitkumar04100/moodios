import { FusionInput, EmotionVector } from "./types";

export function fuseLocal(input: FusionInput): EmotionVector {
  const stress =
    input.face.browTension * 0.4 +
    input.voice.jitter * 0.3 +
    input.typing.pauseFrequency * 0.2 + 
    input.context.appSwitchRate * 0.1;

  const energy =
    input.voice.energy * 0.5 +
    input.face.eyeOpenness * 0.3 +
    input.typing.burstiness * 0.2;

  const calmness = 1 - stress;
  const focus = input.face.attention * 0.5 + input.typing.burstiness * 0.5;

  const mood =
    stress > 0.65
      ? "stressed"
      : focus > 0.6
      ? "focus"
      : energy < 0.3
      ? "tired"
      : energy > 0.7
      ? "creative"
      : "calm";

  return {
    stressLevel: stress,
    energyLevel: energy,
    calmness,
    focusLevel: focus,
    confidence: Math.random() * 0.2 + 0.8,
    activeMood: mood,
  };
}
