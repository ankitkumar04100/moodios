/**
 * Emotion-Adaptive Soundscape Engine
 * Uses Web Audio API oscillators and noise generators.
 * Smooth crossfades between mood soundscapes — no abrupt changes. 
 * 
 * Soundscapes:
 * - Calm → soft rain (filtered noise)
 * - Focus → deep low-frequency hum (sine waves)
 * - Creative → sparkly melody tones (bell-like harmonics)
 * - Stressed → breathing guidance (slow oscillating volume)
 * - Tired → soft minimal ambience (very quiet pad)
 * - Motivated → rhythmic energy pulse (subtle beat)
 * - Overwhelmed → near-silence with very gentle pad
 * - Joyful → warm bright chords
 * - Neutral → ambient room tone
 */

import type { Mood } from '@/types/emotion';

const CROSSFADE_DURATION = 2.0; // seconds
const MAX_VOLUME = 0.12; // never loud

interface SoundscapeNode {
  gain: GainNode;
  nodes: (OscillatorNode | AudioBufferSourceNode)[];
  cleanup: () => void;
}

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let currentMood: Mood | null = null;
let currentScape: SoundscapeNode | null = null;
let isEnabled = false;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = MAX_VOLUME;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// --- Noise Generator ---
function createNoiseBuffer(ac: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ac.sampleRate;
  const length = sampleRate * duration;
  const buffer = ac.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function createNoiseSource(ac: AudioContext): AudioBufferSourceNode {
  const buffer = createNoiseBuffer(ac, 4);
  const source = ac.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

// --- Soundscape Builders ---

function buildCalm(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Soft rain: filtered white noise with low-pass
  const noise = createNoiseSource(ac);
  const lpf = ac.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 800;
  lpf.Q.value = 0.5;

  const hpf = ac.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 200;

  const gain = ac.createGain();
  gain.gain.value = 0;

  noise.connect(lpf).connect(hpf).connect(gain).connect(output);
  noise.start();

  // Slow LFO for rain variation
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 0.15;
  lfoGain.gain.value = 150;
  lfo.connect(lfoGain).connect(lpf.frequency);
  lfo.start();

  return {
    gain,
    nodes: [noise],
    cleanup: () => {
      try { noise.stop(); lfo.stop(); } catch {}
    },
  };
}

function buildFocus(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Deep low-frequency hum: layered sine waves
  const gain = ac.createGain();
  gain.gain.value = 0;

  const oscs: OscillatorNode[] = [];
  const freqs = [60, 90, 120];
  const amps = [0.5, 0.3, 0.2];

  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const oscGain = ac.createGain();
    oscGain.gain.value = amps[i];
    osc.connect(oscGain).connect(gain);
    osc.start();
    oscs.push(osc);
  });

  gain.connect(output);

  return {
    gain,
    nodes: oscs,
    cleanup: () => { oscs.forEach(o => { try { o.stop(); } catch {} }); },
  };
}

function buildCreative(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Sparkly tones: bell-like harmonics with slow arpeggiation
  const gain = ac.createGain();
  gain.gain.value = 0;

  const oscs: OscillatorNode[] = [];
  const bellFreqs = [523, 659, 784, 1047]; // C5, E5, G5, C6

  bellFreqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    // Tremolo for sparkle
    const tremolo = ac.createGain();
    tremolo.gain.value = 0.15;
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.3 + i * 0.15;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain).connect(tremolo.gain);

    osc.connect(tremolo).connect(gain);
    osc.start();
    lfo.start();
    oscs.push(osc);
  });

  gain.connect(output);

  return {
    gain,
    nodes: oscs,
    cleanup: () => { oscs.forEach(o => { try { o.stop(); } catch {} }); },
  };
}

function buildStressed(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Breathing guidance: slow oscillating sine at calming frequency
  const gain = ac.createGain();
  gain.gain.value = 0;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 174; // Solfeggio healing frequency

  // Breathing LFO: ~4 second inhale/exhale cycle
  const breathLFO = ac.createOscillator();
  breathLFO.frequency.value = 1 / 8; // 8 second cycle
  const breathGain = ac.createGain();
  breathGain.gain.value = 0.4;
  breathLFO.connect(breathGain).connect(gain.gain);

  osc.connect(gain).connect(output);
  osc.start();
  breathLFO.start();

  return {
    gain,
    nodes: [osc],
    cleanup: () => { try { osc.stop(); breathLFO.stop(); } catch {} },
  };
}

function buildTired(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Soft minimal pad
  const gain = ac.createGain();
  gain.gain.value = 0;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 220;
  const oscGain = ac.createGain();
  oscGain.gain.value = 0.3;

  const osc2 = ac.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 330;
  const osc2Gain = ac.createGain();
  osc2Gain.gain.value = 0.15;

  osc.connect(oscGain).connect(gain);
  osc2.connect(osc2Gain).connect(gain);
  gain.connect(output);

  osc.start();
  osc2.start();

  return {
    gain,
    nodes: [osc, osc2],
    cleanup: () => { try { osc.stop(); osc2.stop(); } catch {} },
  };
}

function buildMotivated(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Energy pulse: rhythmic sine with faster LFO
  const gain = ac.createGain();
  gain.gain.value = 0;

  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 110;

  const lpf = ac.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 400;

  // Pulse LFO
  const lfo = ac.createOscillator();
  lfo.frequency.value = 2;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 0.3;
  lfo.connect(lfoGain).connect(gain.gain);

  osc.connect(lpf).connect(gain).connect(output);
  osc.start();
  lfo.start();

  return {
    gain,
    nodes: [osc],
    cleanup: () => { try { osc.stop(); lfo.stop(); } catch {} },
  };
}

function buildJoyful(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Warm bright chords
  const gain = ac.createGain();
  gain.gain.value = 0;

  const oscs: OscillatorNode[] = [];
  const chordFreqs = [262, 330, 392, 523]; // C major
  chordFreqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ac.createGain();
    g.gain.value = 0.15 - i * 0.02;
    osc.connect(g).connect(gain);
    osc.start();
    oscs.push(osc);
  });

  gain.connect(output);

  return {
    gain,
    nodes: oscs,
    cleanup: () => { oscs.forEach(o => { try { o.stop(); } catch {} }); },
  };
}

function buildNeutral(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Very quiet room tone
  const gain = ac.createGain();
  gain.gain.value = 0;

  const noise = createNoiseSource(ac);
  const lpf = ac.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 300;
  const noiseGain = ac.createGain();
  noiseGain.gain.value = 0.3;

  noise.connect(lpf).connect(noiseGain).connect(gain).connect(output);
  noise.start();

  return {
    gain,
    nodes: [noise],
    cleanup: () => { try { noise.stop(); } catch {} },
  };
}

function buildOverwhelmed(ac: AudioContext, output: GainNode): SoundscapeNode {
  // Near-silence gentle pad
  const gain = ac.createGain();
  gain.gain.value = 0;

  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 174;
  const g = ac.createGain();
  g.gain.value = 0.15;

  osc.connect(g).connect(gain).connect(output);
  osc.start();

  return {
    gain,
    nodes: [osc],
    cleanup: () => { try { osc.stop(); } catch {} },
  };
}

const builders: Record<Mood, (ac: AudioContext, out: GainNode) => SoundscapeNode> = {
  calm: buildCalm,
  focus: buildFocus,
  creative: buildCreative,
  stressed: buildStressed,
  tired: buildTired,
  motivated: buildMotivated,
  joyful: buildJoyful,
  neutral: buildNeutral,
  overwhelmed: buildOverwhelmed,
};

// --- Public API ---

export function enableSoundscape() {
  isEnabled = true;
  if (currentMood) transitionTo(currentMood);
}

export function disableSoundscape() {
  isEnabled = false;
  if (currentScape) {
    const ac = getContext();
    currentScape.gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.5);
    const old = currentScape;
    setTimeout(() => old.cleanup(), 600);
    currentScape = null;
  }
}

export function isSoundscapeEnabled(): boolean {
  return isEnabled;
}

export function transitionTo(mood: Mood) {
  currentMood = mood;
  if (!isEnabled) return;

  const ac = getContext();
  if (!masterGain) return;

  // Fade out old
  if (currentScape) {
    const oldGain = currentScape.gain;
    oldGain.gain.linearRampToValueAtTime(0, ac.currentTime + CROSSFADE_DURATION);
    const oldCleanup = currentScape.cleanup;
    setTimeout(() => oldCleanup(), CROSSFADE_DURATION * 1000 + 100);
  }

  // Build and fade in new
  const builder = builders[mood];
  if (!builder) return;

  const newScape = builder(ac, masterGain);
  newScape.gain.gain.setValueAtTime(0, ac.currentTime);
  newScape.gain.gain.linearRampToValueAtTime(1, ac.currentTime + CROSSFADE_DURATION);
  currentScape = newScape;
}

export function setMasterVolume(vol: number) {
  if (masterGain) {
    const ac = getContext();
    masterGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(MAX_VOLUME, vol)),
      ac.currentTime + 0.3
    );
  }
}

export function destroySoundscape() {
  disableSoundscape();
  if (ctx) {
    ctx.close();
    ctx = null;
    masterGain = null;
  }
  currentMood = null;
}
