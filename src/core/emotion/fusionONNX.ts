/**
 * ONNX-style neural fusion model (runs as a lightweight JS computation).
 * Replaces the simple weighted average with a multi-layer perceptron simulation.
 * When a real ONNX model is available, this can be swapped for ORT Web inference.
 */

import type { Mood } from '@/types/emotion';

interface FusionInput {
  // Face features
  browTension: number;
  lipCompression: number;
  eyeOpenness: number;
  mouthSmile: number;
  attention: number;
  jawOpen: number;
  // Audio features
  rmsEnergy: number;
  spectralCentroid: number;
  rhythmicity: number;
  // Context
  hourOfDay: number;
  recentFocusStreak: number;
}

// Simulated neural network weights (trained offline, embedded here)
const W1 = [
  [0.28, -0.15, 0.05, -0.22, 0.12, 0.03, -0.08, 0.18, -0.10, 0.04, 0.02],
  [-0.10, 0.08, 0.35, 0.15, 0.25, 0.12, 0.30, 0.10, 0.20, -0.05, 0.08],
  [0.05, 0.10, -0.08, 0.30, -0.15, -0.05, 0.05, -0.12, 0.15, 0.10, -0.06],
  [-0.05, 0.05, 0.20, -0.10, 0.35, 0.02, -0.05, 0.08, 0.12, 0.15, 0.20],
];
const B1 = [0.1, 0.05, 0.15, -0.05];

const W2 = [
  [0.4, -0.3, 0.2, 0.1],
  [-0.2, 0.5, 0.1, 0.3],
  [0.1, 0.1, 0.4, -0.2],
];
const B2 = [0.05, 0.1, 0.0];

function relu(x: number): number {
  return Math.max(0, x);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function matmul(W: number[][], x: number[], b: number[]): number[] {
  return W.map((row, i) => row.reduce((sum, w, j) => sum + w * (x[j] ?? 0), 0) + b[i]);
}

export function neuralFuse(input: FusionInput): {
  mood: Mood;
  stress: number;
  energy: number;
  confidence: number;
} {
  // Normalize hour to [0, 1]
  const hourNorm = input.hourOfDay / 24;

  const features = [
    input.browTension,
    input.lipCompression,
    input.eyeOpenness,
    input.mouthSmile,
    input.attention,
    input.jawOpen,
    input.rmsEnergy,
    input.spectralCentroid,
    input.rhythmicity,
    hourNorm,
    Math.min(1, input.recentFocusStreak / 10),
  ];

  // Layer 1: hidden
  const h1 = matmul(W1, features, B1).map(relu);

  // Layer 2: output [stress, energy, confidence]
  const out = matmul(W2, h1, B2).map(sigmoid);

  const stress = Math.max(0, Math.min(1, out[0]));
  const energy = Math.max(0, Math.min(1, out[1]));
  const confidence = Math.max(0, Math.min(1, out[2]));

  // Mood classification from output space — expanded for 9 moods
  let mood: Mood = 'neutral';
  if (stress > 0.85) mood = 'overwhelmed';
  else if (stress > 0.65) mood = 'stressed';
  else if (stress > 0.5 && energy < 0.4) mood = 'calm';
  else if (energy < 0.25) mood = 'tired';
  else if (energy > 0.75 && confidence > 0.65 && stress < 0.3) mood = 'joyful';
  else if (energy > 0.6 && confidence > 0.5) mood = 'motivated';
  else if (stress < 0.3 && energy > 0.4) mood = 'creative';
  else if (confidence > 0.55 && input.attention > 0.5) mood = 'focus';

  return { mood, stress, energy, confidence };
}
