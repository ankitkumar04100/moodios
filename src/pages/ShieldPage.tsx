import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { Shield, ShieldCheck, ShieldOff, Bell, BellOff, Trash2 } from 'lucide-react';

export default function ShieldPage() {
  const { shieldActive, setShieldActive, queuedNotifications, clearNotifications, emotion } = useEmotionStore();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Notification Shield</h1>
        <p className="text-muted-foreground mt-1">Protect your focus by filtering interruptions based on your emotional state.</p>
      </div>

      {/* Shield Status */}
      <motion.div
        className="glass rounded-2xl p-8 flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
            shieldActive ? 'bg-mode-primary/20' : 'bg-secondary'
          }`}
          animate={shieldActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {shieldActive ? (
            <ShieldCheck size={40} className="text-mode-primary" />
          ) : (
            <ShieldOff size={40} className="text-muted-foreground" />
          )}
        </motion.div>

        <h2 className="font-display text-2xl font-bold text-foreground">
          Shield is {shieldActive ? 'Active' : 'Inactive'}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          {shieldActive
            ? 'Non-essential notifications are being queued. They\'ll be released when your stress drops.'
            : 'All notifications are passing through. Enable the shield for peaceful focus.'}
        </p>

        <button
          onClick={() => setShieldActive(!shieldActive)}
          className={`mt-6 px-6 py-3 rounded-xl font-display font-semibold transition-all ${
            shieldActive
              ? 'bg-secondary text-foreground hover:bg-secondary/80'
              : 'bg-mode-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          {shieldActive ? 'Disable Shield' : 'Enable Shield'}
        </button>

        {/* Stress indicator */}
        <div className="mt-6 w-full max-w-xs">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Current Stress</span>
            <span>{Math.round(emotion.stressLevel * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-mode-primary"
              animate={{ width: `${emotion.stressLevel * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-shield activates above 70% stress
          </p>
        </div>
      </motion.div>

      {/* Queued Notifications */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-mode-primary" />
            <h3 className="font-display font-semibold text-foreground">
              Queued ({queuedNotifications.length})
            </h3>
          </div>
          {queuedNotifications.length > 0 && (
            <button onClick={clearNotifications} className="text-xs text-destructive hover:underline flex items-center gap-1">
              <Trash2 size={12} /> Clear All
            </button>
          )}
        </div>

        {queuedNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <BellOff size={24} className="mx-auto mb-2 opacity-40" />
            No queued notifications
          </div>
        ) : (
          <div className="space-y-2">
            {queuedNotifications.map((n) => (
              <motion.div
                key={n.id}
                className="p-3 rounded-lg bg-secondary/50 flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Bell size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
