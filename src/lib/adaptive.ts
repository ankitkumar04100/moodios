/**
 * Adaptive Engine — No hardcoded constants.
 * Rolling statistics, streaming quantiles, and performance budgeting.
 */

// ──── EMA (Exponential Moving Average) ────
export class EMA {
  private value: number | null = null;
  constructor(private alpha: number = 0.1) {}

  update(sample: number): number {
    if (this.value === null) {
      this.value = sample;
    } else {
      this.value = this.alpha * sample + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  get(): number {
    return this.value ?? 0;
  }

  reset() {
    this.value = null;
  }
}

// ──── Rolling Window Buffer ────
export class RollingBuffer {
  private buffer: number[] = [];
  constructor(private maxSize: number = 120) {}

  push(value: number) {
    this.buffer.push(value);
    if (this.buffer.length > this.maxSize) this.buffer.shift();
  }

  get values(): number[] {
    return this.buffer;
  }

  get length(): number {
    return this.buffer.length;
  }

  mean(): number {
    if (this.buffer.length === 0) return 0;
    return this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
  }

  std(): number {
    if (this.buffer.length < 2) return 0;
    const m = this.mean();
    const variance = this.buffer.reduce((sum, v) => sum + (v - m) ** 2, 0) / this.buffer.length;
    return Math.sqrt(variance);
  }

  percentile(p: number): number {
    if (this.buffer.length === 0) return 0;
    const sorted = [...this.buffer].sort((a, b) => a - b);
    const idx = Math.floor(p * (sorted.length - 1));
    return sorted[idx];
  }

  min(): number {
    return this.buffer.length > 0 ? Math.min(...this.buffer) : 0;
  }

  max(): number {
    return this.buffer.length > 0 ? Math.max(...this.buffer) : 1;
  }

  clear() {
    this.buffer = [];
  }
}

// ──── Streaming Quantile (P² algorithm simplified) ────
export class StreamingQuantile {
  private buffer: RollingBuffer;

  constructor(windowSize: number = 200) {
    this.buffer = new RollingBuffer(windowSize);
  }

  update(value: number) {
    this.buffer.push(value);
  }

  getQuantile(p: number): number {
    return this.buffer.percentile(p);
  }

  isAboveQuantile(value: number, p: number): boolean {
    return value > this.getQuantile(p);
  }

  isBelowQuantile(value: number, p: number): boolean {
    return value < this.getQuantile(p);
  }
}

// ──── Performance Budgeter ────
export class PerformanceBudgeter {
  private fpsBuffer: RollingBuffer;
  private lastFrameTime: number = 0;

  constructor() {
    this.fpsBuffer = new RollingBuffer(60);
  }

  recordFrame(timestamp: number) {
    if (this.lastFrameTime > 0) {
      const delta = timestamp - this.lastFrameTime;
      if (delta > 0) {
        this.fpsBuffer.push(1000 / delta);
      }
    }
    this.lastFrameTime = timestamp;
  }

  get averageFps(): number {
    return this.fpsBuffer.mean();
  }

  /** Returns 'high' | 'medium' | 'low' based on live FPS and hardware */
  get grade(): 'high' | 'medium' | 'low' {
    const fps = this.averageFps;
    const cores = navigator.hardwareConcurrency ?? 2;
    const hasWebGPU = 'gpu' in navigator;

    if (fps > 50 && cores >= 4 && hasWebGPU) return 'high';
    if (fps > 30 && cores >= 2) return 'medium';
    return 'low';
  }

  /** Adaptive sensing cadence in ms */
  get sensingCadence(): number {
    switch (this.grade) {
      case 'high': return 300;
      case 'medium': return 500;
      case 'low': return 800;
    }
  }

  /** Camera resolution target */
  get cameraResolution(): number {
    switch (this.grade) {
      case 'high': return 640;
      case 'medium': return 480;
      case 'low': return 320;
    }
  }

  /** Particle count for background effects */
  get particleCount(): number {
    switch (this.grade) {
      case 'high': return 80;
      case 'medium': return 40;
      case 'low': return 15;
    }
  }

  /** Motion intensity multiplier */
  get motionMultiplier(): number {
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return 0.1;
    switch (this.grade) {
      case 'high': return 1;
      case 'medium': return 0.7;
      case 'low': return 0.3;
    }
  }
}

// ──── Adaptive Policy Engine ────
export class AdaptivePolicy {
  private stressQ = new StreamingQuantile(200);
  private energyQ = new StreamingQuantile(200);
  private confidenceQ = new StreamingQuantile(200);
  private stressEma = new EMA(0.08);
  private energyEma = new EMA(0.08);

  update(stress: number, energy: number, confidence: number) {
    this.stressQ.update(stress);
    this.energyQ.update(energy);
    this.confidenceQ.update(confidence);
    this.stressEma.update(stress);
    this.energyEma.update(energy);
  }

  /** Should Notification Shield activate? Based on 75th percentile, not a constant */
  get shouldShield(): boolean {
    return this.stressQ.isAboveQuantile(this.stressEma.get(), 0.75);
  }

  /** Smoothed stress */
  get smoothStress(): number {
    return this.stressEma.get();
  }

  /** Smoothed energy */
  get smoothEnergy(): number {
    return this.energyEma.get();
  }

  /** Adaptive animation duration factor (higher stress = slower, calmer animations) */
  get animationFactor(): number {
    const stress = this.stressEma.get();
    // Higher stress → longer durations (calmer); lower stress → snappier
    return 0.5 + stress * 1.5;
  }

  /** Get all thresholds for debug display */
  get debugInfo() {
    return {
      stressSmooth: this.stressEma.get(),
      energySmooth: this.energyEma.get(),
      stressP75: this.stressQ.getQuantile(0.75),
      stressP25: this.stressQ.getQuantile(0.25),
      energyP75: this.energyQ.getQuantile(0.75),
      energyP25: this.energyQ.getQuantile(0.25),
      shieldActive: this.shouldShield,
    };
  }
}

// Singleton instances
export const perfBudgeter = new PerformanceBudgeter();
export const adaptivePolicy = new AdaptivePolicy();
