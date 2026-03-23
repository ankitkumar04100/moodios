import { FusionInput, EmotionVector } from "./types";
import { fuseLocal } from "./fusionLocal";
import { fuseCloud } from "./fusionCloud";

export async function fuseEmotion(
  input: FusionInput,
  useCloud: boolean
): Promise<EmotionVector> {
  if (useCloud) {
    try {
      return await fuseCloud(input);
    } catch {
      return fuseLocal(input);
    }
  }
  return fuseLocal(input);
}
