import { create } from 'zustand';
import type { Mood, EmotionState, SensorPermissions } from '@/types/emotion';

interface EmotionStore {
  emotion: EmotionState;
  setEmotion: (state: Partial<EmotionState>) => void;
  activeMood: Mood;
  moodOverride: Mood | null;
  setMoodOverride: (mood: Mood | null) => void;
  sensingActive: boolean;
  sensingMode: 'real' | 'simulation' | 'off';
  setSensingMode: (mode: 'real' | 'simulation' | 'off') => void;
  toggleSensing: () => void;
  killSwitch: () => void;
  permissions: SensorPermissions;
  setPermission: (key: keyof SensorPermissions, value: string | boolean) => void;
  recentHistory: EmotionState[];
  addToHistory: (state: EmotionState) => void;
  shieldActive: boolean;
  setShieldActive: (active: boolean) => void;
  queuedNotifications: { id: string; title: string; body: string; timestamp: number }[];
  addNotification: (n: { title: string; body: string }) => void;
  clearNotifications: () => void;
  splashSeen: boolean;
  setSplashSeen: (seen: boolean) => void;
  // Voice assistant
  voicePrompt: { message: string; action: string; mood: Mood } | null;
  setVoicePrompt: (p: { message: string; action: string; mood: Mood } | null) => void;
}

function deriveMood(e: EmotionState): Mood {
  if (e.stressLevel > 0.85) return 'overwhelmed';
  if (e.stressLevel > 0.7) return 'stressed';
  if (e.energyLevel < 0.25) return 'tired';
  if (e.energyLevel > 0.8 && e.confidence > 0.7 && e.stressLevel < 0.3) return 'joyful';
  if (e.energyLevel > 0.7 && e.confidence > 0.5) return 'motivated';
  if (e.stressLevel < 0.3 && e.energyLevel > 0.5) return 'creative';
  if (e.confidence > 0.6) return 'focus';
  if (e.stressLevel > 0.5) return 'calm';
  return 'neutral';
}

export const useEmotionStore = create<EmotionStore>()((set, get) => ({
  emotion: {
    mood: 'neutral',
    confidence: 0,
    stressLevel: 0.3,
    energyLevel: 0.5,
    lastUpdated: Date.now(),
    reasoning: 'Initial state — awaiting behavioral signals.',
  },
  setEmotion: (partial) => {
    const current = get().emotion;
    const updated = { ...current, ...partial, lastUpdated: Date.now() };
    set({ emotion: updated });
    if (!get().moodOverride) {
      set({ activeMood: deriveMood(updated) });
    }
    if (updated.stressLevel > 0.7) {
      set({ shieldActive: true });
    }
  },
  activeMood: 'neutral' as Mood,
  moodOverride: null,
  setMoodOverride: (mood) => set({ moodOverride: mood, activeMood: mood || deriveMood(get().emotion) }),
  sensingActive: false,
  sensingMode: 'off',
  setSensingMode: (mode) => set({ sensingMode: mode, sensingActive: mode !== 'off' }),
  toggleSensing: () => {
    const s = get();
    if (s.sensingActive) {
      set({ sensingActive: false, sensingMode: 'off' });
    } else {
      set({ sensingActive: true, sensingMode: 'simulation' });
    }
  },
  killSwitch: () => set({ sensingActive: false, sensingMode: 'off' }),
  permissions: {
    camera: 'not-requested',
    microphone: 'not-requested',
    notifications: 'not-requested',
    wakeLock: false,
  },
  setPermission: (key, value) => set((s) => ({ permissions: { ...s.permissions, [key]: value } })),
  recentHistory: [],
  addToHistory: (state) => set((s) => {
    const history = [...s.recentHistory, state];
    return { recentHistory: history.slice(-600) };
  }),
  shieldActive: false,
  setShieldActive: (active) => set({ shieldActive: active }),
  queuedNotifications: [],
  addNotification: (n) => set((s) => ({
    queuedNotifications: [...s.queuedNotifications, { ...n, id: crypto.randomUUID(), timestamp: Date.now() }],
  })),
  clearNotifications: () => set({ queuedNotifications: [] }),
  splashSeen: typeof window !== 'undefined' && localStorage.getItem('moodios-splash-seen') === 'true',
  setSplashSeen: (seen) => {
    if (typeof window !== 'undefined') localStorage.setItem('moodios-splash-seen', String(seen));
    set({ splashSeen: seen });
  },
  voicePrompt: null,
  setVoicePrompt: (p) => set({ voicePrompt: p }),
}));
