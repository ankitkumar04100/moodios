export type Mood = 'calm' | 'focus' | 'creative' | 'tired' | 'motivated' | 'neutral';

export interface EmotionState {
  mood: Mood;
  confidence: number;
  stressLevel: number;
  energyLevel: number;
  lastUpdated: number;
}

export interface SensorPermissions {
  camera: PermissionState | 'not-requested';
  microphone: PermissionState | 'not-requested';
  notifications: NotificationPermission | 'not-requested';
  wakeLock: boolean;
}

export type PermissionState = 'granted' | 'denied' | 'prompt';

export interface MoodTheme {
  mood: Mood;
  label: string;
  description: string;
  icon: string;
  className: string;
}

export const MOOD_THEMES: MoodTheme[] = [
  { mood: 'calm', label: 'Calm', description: 'Warm, peaceful, low-motion sanctuary', icon: '🌊', className: 'mood-calm' },
  { mood: 'focus', label: 'Focus', description: 'High-contrast, minimal distractions', icon: '🎯', className: 'mood-focus' },
  { mood: 'creative', label: 'Creative', description: 'Vibrant, playful, full of energy', icon: '✨', className: 'mood-creative' },
  { mood: 'tired', label: 'Tired', description: 'Dimmed, gentle, breathing space', icon: '🌙', className: 'mood-tired' },
  { mood: 'motivated', label: 'Motivated', description: 'Bold, punchy, action-ready', icon: '🔥', className: 'mood-motivated' },
];
