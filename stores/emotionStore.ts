import { create } from "zustand";
import { fuseEmotion } from "@/core/emotion/fusionManager";

export const useEmotionStore = create((set, get) => ({
  emotion: {
    stressLevel: 0,
    energyLevel: 0,
    calmness: 0,
    focusLevel: 0,
    confidence: 0,
    activeMood: "calm",
  },
  sensingActive: false,

  async update(input) {
    const data = await fuseEmotion(input, true);
    set({ emotion: data });
  },

  toggleSensing() {
    set({ sensingActive: !get().sensingActive });
  },
}));
