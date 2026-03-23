import { create } from "zustand";
import { fuseEmotion } from "@/core/emotion";

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
    const output = await fuseEmotion(input, true);

    set((state) => ({
      emotion: output,
      recentHistory: [...state.recentHistory, output].slice(-50),
    }));
  },

  toggleSensing() {
    set({ sensingActive: !get().sensingActive });
  },
}));
``
