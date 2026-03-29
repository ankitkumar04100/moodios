import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { Camera, Mic, Bell, RotateCcw, Database, Cpu, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { permissions, setPermission, sensingMode, setSensingMode } = useEmotionStore();

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
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[state] || colors['not-requested']}`}>
        {state === 'not-requested' ? 'Not set' : state}
      </span>
    );
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs text-mode-primary uppercase tracking-widest font-display">Preferences</p>
        <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage permissions, sensing engine, and privacy.</p>
      </div>

      {/* Sensing Mode */}
      <motion.div className="glass rounded-2xl p-6 space-y-4" custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Cpu size={16} className="text-mode-primary" />
          Sensing Engine
        </h3>
        <div className="space-y-2">
          {[
            { mode: 'real' as const, icon: Eye, label: 'Real Sensors', desc: 'Camera + Microphone for true emotion detection' },
            { mode: 'simulation' as const, icon: EyeOff, label: 'Simulation', desc: 'Behavioral analysis without sensors' },
            { mode: 'off' as const, icon: EyeOff, label: 'Off', desc: 'Disable all sensing' },
          ].map(({ mode, icon: Icon, label, desc }) => (
            <button
              key={mode}
              onClick={() => setSensingMode(mode)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                sensingMode === mode ? 'bg-mode-primary/10 ring-1 ring-mode-primary/30' : 'hover:bg-secondary'
              }`}
            >
              <Icon size={18} className={sensingMode === mode ? 'text-mode-primary' : 'text-muted-foreground'} />
              <div>
                <p className={`text-sm font-medium ${sensingMode === mode ? 'text-mode-primary' : 'text-foreground'}`}>{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Permissions */}
      <motion.div className="glass rounded-2xl p-6 space-y-4" custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck size={16} className="text-mode-primary" />
          Sensor Permissions
        </h3>
        <p className="text-xs text-muted-foreground">All processing happens locally. No data leaves your device.</p>

        {[
          { key: 'camera' as const, icon: Camera, label: 'Camera', desc: 'Micro-expression & face landmark detection', action: requestCamera },
          { key: 'microphone' as const, icon: Mic, label: 'Microphone', desc: 'Prosody analysis (pitch, energy, tempo)', action: requestMic },
          { key: 'notifications' as const, icon: Bell, label: 'Notifications', desc: 'Mood-aware notification delivery', action: requestNotifications },
        ].map(({ key, icon: Icon, label, desc, action }) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-mode-primary/10 flex items-center justify-center">
                <Icon size={18} className="text-mode-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusChip(permissions[key] as string)}
              {(permissions[key] === 'not-requested' || permissions[key] === 'prompt') && (
                <button
                  onClick={action}
                  className="px-3 py-1.5 text-xs rounded-lg bg-mode-primary/10 text-mode-primary font-medium hover:bg-mode-primary/20 transition-colors"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Privacy */}
      <motion.div className="glass rounded-2xl p-6 space-y-4" custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Database size={16} className="text-mode-primary" />
          Privacy & Data
        </h3>
        <div className="space-y-3 text-sm">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <p className="font-medium text-foreground flex items-center gap-2">🔒 Local-Only Processing</p>
            <p className="text-xs text-muted-foreground mt-1.5">All emotion detection runs entirely on your device. No images, audio, or raw data ever leaves your browser.</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <p className="font-medium text-foreground flex items-center gap-2">📊 Stored Data</p>
            <p className="text-xs text-muted-foreground mt-1.5">Only aggregated statistics (stress/energy averages, mood durations) are stored locally via DuckDB-Wasm for the timeline.</p>
          </div>
        </div>
        <button
          onClick={() => {
            useEmotionStore.setState({ recentHistory: [] });
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
        >
          <RotateCcw size={14} /> Clear All Timeline Data
        </button>
      </motion.div>
    </div>
  );
}
