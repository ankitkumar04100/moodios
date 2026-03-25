/**
 * Web Audio API Prosody Analyzer
 * Extracts RMS energy, spectral centroid, and rhythmicity from a live mic stream.
 * No audio is recorded or stored — only numerical features are kept in memory.
 */

export interface ProsodyFeatures {
  rmsEnergy: number;       // 0..1 normalized loudness
  spectralCentroid: number; // 0..1 normalized pitch proxy
  rhythmicity: number;      // 0..1 periodicity measure
}

export class ProsodyAnalyzer {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private timeDomain: Float32Array = new Float32Array(0);
  private freqDomain: Float32Array = new Float32Array(0);
  private energyHistory: number[] = [];
  private readonly HISTORY_SIZE = 60; // ~1-2 seconds of frames for rhythmicity

  async init(stream: MediaStream): Promise<void> {
    this.ctx = new AudioContext();
    this.source = this.ctx.createMediaStreamSource(stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.3;
    this.source.connect(this.analyser);
    // Don't connect to destination — we don't want playback

    const bufLen = this.analyser.fftSize;
    this.timeDomain = new Float32Array(bufLen);
    this.freqDomain = new Float32Array(this.analyser.frequencyBinCount);
  }

  extract(): ProsodyFeatures {
    if (!this.analyser || !this.ctx) {
      return { rmsEnergy: 0, spectralCentroid: 0, rhythmicity: 0 };
    }

    this.analyser.getFloatTimeDomainData(this.timeDomain as any);
    this.analyser.getFloatFrequencyData(this.freqDomain as any);

    const rms = this.computeRMS();
    const centroid = this.computeSpectralCentroid();
    const rhythmicity = this.computeRhythmicity(rms);

    return {
      rmsEnergy: Math.min(1, rms * 5), // scale up for sensitivity
      spectralCentroid: centroid,
      rhythmicity,
    };
  }

  private computeRMS(): number {
    let sum = 0;
    for (let i = 0; i < this.timeDomain.length; i++) {
      sum += this.timeDomain[i] * this.timeDomain[i];
    }
    return Math.sqrt(sum / this.timeDomain.length);
  }

  private computeSpectralCentroid(): number {
    if (!this.analyser || !this.ctx) return 0;

    const nyquist = this.ctx.sampleRate / 2;
    const binCount = this.freqDomain.length;
    let weightedSum = 0;
    let totalMagnitude = 0;

    for (let i = 0; i < binCount; i++) {
      // freqDomain is in dB, convert to linear magnitude
      const magnitude = Math.pow(10, this.freqDomain[i] / 20);
      const frequency = (i / binCount) * nyquist;
      weightedSum += frequency * magnitude;
      totalMagnitude += magnitude;
    }

    if (totalMagnitude === 0) return 0;

    const centroidHz = weightedSum / totalMagnitude;
    // Normalize: human speech is ~85-300 Hz fundamental, but spectral centroid
    // for speech is typically 500-4000 Hz. Normalize to 0-1 range.
    return Math.min(1, Math.max(0, centroidHz / 4000));
  }

  private computeRhythmicity(currentRMS: number): number {
    this.energyHistory.push(currentRMS);
    if (this.energyHistory.length > this.HISTORY_SIZE) {
      this.energyHistory.shift();
    }

    if (this.energyHistory.length < 10) return 0;

    // Compute autocorrelation of energy history to detect periodicity
    const h = this.energyHistory;
    const n = h.length;
    const mean = h.reduce((a, b) => a + b, 0) / n;
    const variance = h.reduce((s, v) => s + (v - mean) ** 2, 0) / n;

    if (variance < 1e-10) return 0;

    // Check autocorrelation at common speech rhythm lags (5-15 frames ≈ 150-500ms)
    let maxCorr = 0;
    for (let lag = 3; lag < Math.min(20, n / 2); lag++) {
      let corr = 0;
      for (let i = 0; i < n - lag; i++) {
        corr += (h[i] - mean) * (h[i + lag] - mean);
      }
      corr /= (n - lag) * variance;
      maxCorr = Math.max(maxCorr, corr);
    }

    return Math.max(0, Math.min(1, maxCorr));
  }

  destroy(): void {
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.ctx?.close();
    this.ctx = null;
    this.analyser = null;
    this.source = null;
    this.energyHistory = [];
  }
}
