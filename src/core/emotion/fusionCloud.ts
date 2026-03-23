import { FusionInput, EmotionVector } from "./types";

export async function fuseCloud(input: FusionInput): Promise<EmotionVector> {
  const res = await fetch("https://YOUR_CLOUD_FUSION_API/fuse", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
  });

  return await res.json();
}
