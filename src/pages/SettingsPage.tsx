import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { Camera, Mic, Bell, Monitor, Moon, Sun, RotateCcw, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const { permissions, setPermission, isDark, toggleDark } = useEmotionStore();

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission('camera', 'granted');
    } catch {
      setPermission('camera', 'denied');
    }
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission('microphone', 'granted');
    } catch {
      setPermission('microphone', 'denied');
    }
  };

  const requestNotifications = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission('notifications', result);
    } catch {
      setPermission('notifications', 'denied');
    }
  };

  const statusChip = (state: string) => {
    const colors: Record<string, string> = {
      granted: 'bg-emerald-500/15 text-emerald-600',
      denied: 'bg-destructive/15 text-destructive',
      prompt: 'bg-amber-500/15 text-amber-600',
      'not-requested': 'bg-secondary text-muted-foreground',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[state] || colors['not-requested']}`}>
        {state === 'not-requested' ? 'Not requested' : state}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage permissions, appearance, and privacy.</p>
      </div>

      {/* Appearance */}
      <motion.div className="glass rounded-2xl p-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="font-display font-semibold text-foreground">Appearance</h3>
        <button
          onClick={toggleDark}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={18} className="text-mode-primary" /> : <Sun size={18} className="text-mode-primary" />}
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-xs text-muted-foreground">Switch between day and night themes</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </motion.div>

      {/* Permissions */}
      <motion.div className="glass rounded-2xl p-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-display font-semibold text-foreground">Sensor Permissions</h3>
        <p className="text-xs text-muted-foreground">All processing happens locally on your device. No data is sent to any server.</p>

        {[
          { key: 'camera' as const, icon: Camera, label: 'Camera', desc: 'Used for micro-expression detection (face landmarks)', action: requestCamera },
          { key: 'microphone' as const, icon: Mic, label: 'Microphone', desc: 'Used for prosody analysis (pitch, energy, tempo)', action: requestMic },
          { key: 'notifications' as const, icon: Bell, label: 'Notifications', desc: 'Receive mood-aware notifications', action: requestNotifications },
        ].map(({ key, icon: Icon, label, desc, action }) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-mode-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusChip(permissions[key] as string)}
              {permissions[key] === 'not-requested' && (
                <button
                  onClick={action}
                  className="px-3 py-1 text-xs rounded-lg bg-mode-primary/10 text-mode-primary font-medium hover:bg-mode-primary/20"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Privacy */}
      <motion.div className="glass rounded-2xl p-6 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-display font-semibold text-foreground">Privacy & Data</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="font-medium text-foreground">🔒 Local-Only Processing</p>
            <p className="text-xs text-muted-foreground mt-1">All emotion detection runs entirely on your device. No images, audio, or raw data ever leaves your browser.</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="font-medium text-foreground">📊 Stored Data</p>
            <p className="text-xs text-muted-foreground mt-1">Only aggregated statistics (stress/energy averages, mood durations) are stored locally for the timeline.</p>
          </div>
        </div>
        <button
          onClick={() => {
            useEmotionStore.setState({ recentHistory: [] });
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <RotateCcw size={14} /> Clear All Timeline Data
        </button>
      </motion.div>
    </div>
  );
}
