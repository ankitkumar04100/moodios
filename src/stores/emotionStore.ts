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

  recentHistory: [],

  sensingActive: false,

  async update(input) {
    const result = await fuseEmotion(input, true);

    set((state) => ({
      emotion: result,
      recentHistory: [...state.recentHistory, result].slice(-50),
    }));
  },

  toggleSensing() {
    set({ sensingActive: !get().sensingActive });
  },
}));
