import { FaceFeatures } from "./types";

export async function extractFaceFeatures(landmarks: any): Promise<FaceFeatures> { 
  if (!landmarks) {
    return {
      browTension: 0,
      eyeOpenness: 0,
      lipCompression: 0,
      microExpressionIntensity: 0,
      attention: 0,
    };
  }

  // Example REAL metrics using landmark distances
  const leftEye = landmarks[159].y - landmarks[145].y;
  const rightEye = landmarks[386].y - landmarks[374].y;
  const eyeOpenness = (leftEye + rightEye) / 2;

  const browDistance = landmarks[70].y - landmarks[105].y;
  const browTension = Math.max(0, 1 - browDistance * 5);

  const lipTop = landmarks[13].y;
  const lipBottom = landmarks[14].y;
  const lipCompression = Math.max(0, 1 - Math.abs(lipBottom - lipTop) * 20);

  const microExpressionIntensity =
    (browTension + lipCompression + eyeOpenness) / 3;

  const attention = 1 - Math.abs(landmarks[1].x - 0.5);

  return {
    browTension,
    eyeOpenness,
    lipCompression,
    microExpressionIntensity,
    attention,
  };
}
