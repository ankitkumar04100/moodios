/**
 * MediaPipe Face Landmarker wrapper.
 * Extracts face landmarks + blendshape coefficients from a live camera feed.
 * No frames are stored — only numerical features are kept in memory.
 */

import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface FaceFeatures {
  browTension: number;
  eyeOpenness: number;
  lipCompression: number;
  mouthSmile: number;
  jawOpen: number;
  attention: number; // how centered the face is
  blendshapes: Record<string, number>;
}

const DEFAULT_FEATURES: FaceFeatures = {
  browTension: 0,
  eyeOpenness: 0.5,
  lipCompression: 0,
  mouthSmile: 0,
  jawOpen: 0,
  attention: 0,
  blendshapes: {},
};

export class FaceLandmarkerEngine {
  private landmarker: FaceLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private running = false;
  private lastResult: FaceFeatures = { ...DEFAULT_FEATURES };
  private rafId: number = 0;
  private onUpdate: ((features: FaceFeatures) => void) | null = null;

  async init(stream: MediaStream, onUpdate: (features: FaceFeatures) => void): Promise<void> {
    this.onUpdate = onUpdate;

    // Create hidden video element
    this.video = document.createElement('video');
    this.video.srcObject = stream;
    this.video.setAttribute('playsinline', 'true');
    this.video.muted = true;
    this.video.style.position = 'fixed';
    this.video.style.opacity = '0';
    this.video.style.pointerEvents = 'none';
    this.video.style.width = '1px';
    this.video.style.height = '1px';
    document.body.appendChild(this.video);
    await this.video.play();

    // Initialize MediaPipe
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    this.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: false,
    });

    this.running = true;
    this.processFrame();
  }

  private processFrame = (): void => {
    if (!this.running || !this.video || !this.landmarker) return;

    if (this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      const now = performance.now();
      try {
        const result = this.landmarker.detectForVideo(this.video, now);
        this.lastResult = this.extractFeatures(result);
        this.onUpdate?.(this.lastResult);
      } catch {
        // Frame timing issue — skip
      }
    }

    this.rafId = requestAnimationFrame(this.processFrame);
  };

  private extractFeatures(result: FaceLandmarkerResult): FaceFeatures {
    if (!result.faceLandmarks?.length) return { ...DEFAULT_FEATURES };

    const landmarks = result.faceLandmarks[0];
    const blendshapes: Record<string, number> = {};

    // Extract blendshape scores if available
    if (result.faceBlendshapes?.length) {
      for (const bs of result.faceBlendshapes[0].categories) {
        blendshapes[bs.categoryName] = bs.score;
      }
    }

    // Derive features from blendshapes (preferred) or landmarks
    const browInnerUp = (blendshapes['browInnerUp'] ?? 0);
    const browDownLeft = (blendshapes['browDownLeft'] ?? 0);
    const browDownRight = (blendshapes['browDownRight'] ?? 0);
    const browTension = Math.max(browDownLeft, browDownRight) - browInnerUp * 0.5;

    const eyeBlinkLeft = blendshapes['eyeBlinkLeft'] ?? 0;
    const eyeBlinkRight = blendshapes['eyeBlinkRight'] ?? 0;
    const eyeOpenness = 1 - (eyeBlinkLeft + eyeBlinkRight) / 2;

    const mouthPressLeft = blendshapes['mouthPressLeft'] ?? 0;
    const mouthPressRight = blendshapes['mouthPressRight'] ?? 0;
    const lipCompression = (mouthPressLeft + mouthPressRight) / 2;

    const mouthSmileLeft = blendshapes['mouthSmileLeft'] ?? 0;
    const mouthSmileRight = blendshapes['mouthSmileRight'] ?? 0;
    const mouthSmile = (mouthSmileLeft + mouthSmileRight) / 2;

    const jawOpen = blendshapes['jawOpen'] ?? 0;

    // Attention: how centered is the nose tip (landmark 1)
    const noseTip = landmarks[1];
    const attention = noseTip ? 1 - Math.abs(noseTip.x - 0.5) * 2 : 0;

    return {
      browTension: Math.max(0, Math.min(1, browTension)),
      eyeOpenness: Math.max(0, Math.min(1, eyeOpenness)),
      lipCompression: Math.max(0, Math.min(1, lipCompression)),
      mouthSmile: Math.max(0, Math.min(1, mouthSmile)),
      jawOpen: Math.max(0, Math.min(1, jawOpen)),
      attention: Math.max(0, Math.min(1, attention)),
      blendshapes,
    };
  }

  getLatest(): FaceFeatures {
    return this.lastResult;
  }

  destroy(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video.remove();
      this.video = null;
    }
    this.landmarker?.close();
    this.landmarker = null;
    this.onUpdate = null;
  }
}
