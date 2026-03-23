import { create } from 'zustand';
import type { Mood, EmotionState, SensorPermissions } from '@/types/emotion';

interface EmotionStore {
  // Current emotion state
  emotion: EmotionState;
  setEmotion: (state: Partial<EmotionState>) => void;

  // Active mood (can be auto or manual override)
  activeMood: Mood;
  moodOverride: Mood | null;
  setMoodOverride: (mood: Mood | null) => void;

  // Sensing
  sensingActive: boolean;
  toggleSensing: () => void;
  killSwitch: () => void;

  // Permissions
  permissions: SensorPermissions;
  setPermission: (key: keyof SensorPermissions, value: any) => void;

  // Day/Night
  isDark: boolean;
  toggleDark: () => void;
  setDark: (dark: boolean) => void;

  // Timeline data (last 30 min for mini scrub)
  recentHistory: EmotionState[];
  addToHistory: (state: EmotionState) => void;

  // Notification shield
  shieldActive: boolean;
  setShieldActive: (active: boolean) => void;
  queuedNotifications: { id: string; title: string; body: string; timestamp: number }[];
  addNotification: (n: { title: string; body: string }) => void;
  clearNotifications: () => void;
}

export const useEmotionStore = create<EmotionStore>((set, get) => ({
  emotion: {
    mood: 'neutral',
    confidence: 0,
    stressLevel: 0.3,
    energyLevel: 0.5,
    lastUpdated: Date.now(),
  },
  setEmotion: (partial) => {
    const current = get().emotion;
    const updated = { ...current, ...partial, lastUpdated: Date.now() };
    set({ emotion: updated });

    // Auto-determine mood if no override
    if (!get().moodOverride) {
      const mood = deriveMood(updated);
      set({ activeMood: mood });
    }

    // Auto shield
    if (updated.stressLevel > 0.7) {
      set({ shieldActive: true });
    }
  },

  activeMood: 'neutral' as Mood,
  moodOverride: null,
  setMoodOverride: (mood) => set({ moodOverride: mood, activeMood: mood || deriveMood(get().emotion) }),

  sensingActive: false,
  toggleSensing: () => set((s) => ({ sensingActive: !s.sensingActive })),
  killSwitch: () => set({ sensingActive: false }),

  permissions: {
    camera: 'not-requested',
    microphone: 'not-requested',
    notifications: 'not-requested',
    wakeLock: false,
  },
  setPermission: (key, value) => set((s) => ({ permissions: { ...s.permissions, [key]: value } })),

  isDark: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  toggleDark: () => set((s) => ({ isDark: !s.isDark })),
  setDark: (dark) => set({ isDark: dark }),

  recentHistory: [],
  addToHistory: (state) => set((s) => {
    const history = [...s.recentHistory, state];
    // Keep last 30 minutes (600 entries at 300ms, but store 1 per 3s = ~600)
    return { recentHistory: history.slice(-600) };
  }),

  shieldActive: false,
  setShieldActive: (active) => set({ shieldActive: active }),
  queuedNotifications: [],
  addNotification: (n) => set((s) => ({
    queuedNotifications: [...s.queuedNotifications, { ...n, id: crypto.randomUUID(), timestamp: Date.now() }],
  })),
  clearNotifications: () => set({ queuedNotifications: [] }),
}));

function deriveMood(e: EmotionState): Mood {
  if (e.stressLevel > 0.7) return 'calm';
  if (e.energyLevel < 0.3) return 'tired';
  if (e.energyLevel > 0.7 && e.confidence > 0.5) return 'motivated';
  if (e.stressLevel < 0.3 && e.energyLevel > 0.5) return 'creative';
  if (e.confidence > 0.6) return 'focus';
  return 'neutral';
}
