import { motion } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { Shield, ShieldCheck, ShieldOff, Bell, BellOff, Trash2, Info, Clock, TrendingDown } from 'lucide-react';
import BreathingOrb from '@/components/BreathingOrb';

export default function ShieldPage() {
  const { shieldActive, setShieldActive, queuedNotifications, clearNotifications, emotion, addNotification } = useEmotionStore();

  const testNotification = () => {
    addNotification({
      title: ['New Message', 'Calendar Reminder', 'App Update', 'Social Alert'][Math.floor(Math.random() * 4)],
      body: ['You have a new notification', 'Meeting in 15 minutes', 'Version 2.0 available', 'Someone liked your post'][Math.floor(Math.random() * 4)],
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs text-mode-primary uppercase tracking-widest font-display flex items-center gap-1.5">
          <Shield size={14} /> Mental Protection
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground">Notification Shield</h1>
        <p className="text-muted-foreground mt-1 text-sm">Protect your focus by filtering interruptions based on your emotional state.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shield Status (2/3) */}
        <motion.div
          className="lg:col-span-2 glass rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-mode-primary/5 to-transparent" />
          
          <div className="relative z-10">
            <motion.div
              className={`w-28 h-28 rounded-full flex items-center justify-center mb-5 ${
                shieldActive ? 'bg-mode-primary/15' : 'bg-secondary'
              }`}
              animate={shieldActive ? {
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 0 0 hsl(var(--mode-primary) / 0)',
                  '0 0 30px 10px hsl(var(--mode-primary) / 0.15)',
                  '0 0 0 0 hsl(var(--mode-primary) / 0)',
                ],
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {shieldActive ? (
                <ShieldCheck size={48} className="text-mode-primary" />
              ) : (
                <ShieldOff size={48} className="text-muted-foreground" />
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

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShieldActive(!shieldActive)}
                className={`px-6 py-3 rounded-xl font-display font-semibold transition-all ${
                  shieldActive
                    ? 'bg-secondary text-foreground hover:bg-secondary/80'
                    : 'bg-mode-primary text-primary-foreground hover:opacity-90 shadow-lg'
                }`}
              >
                {shieldActive ? 'Disable Shield' : 'Enable Shield'}
              </button>
              <button
                onClick={testNotification}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                Test Alert
              </button>
            </div>

            {/* Stress bar */}
            <div className="mt-8 w-full max-w-sm">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1"><TrendingDown size={12} /> Current Stress</span>
                <span className="font-medium">{Math.round(emotion.stressLevel * 100)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-mode-primary to-mode-glow"
                  animate={{ width: `${emotion.stressLevel * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Info size={10} /> Auto-shield activates at high stress quantiles
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Breathing widget when stressed */}
          {emotion.stressLevel > 0.5 && (
            <motion.div
              className="glass rounded-xl p-5 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-xs text-muted-foreground font-display mb-2">Breathe & Relax</p>
              <BreathingOrb size={120} />
            </motion.div>
          )}

          {/* Stats */}
          <motion.div className="glass rounded-xl p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-display text-sm font-semibold text-foreground mb-3">Shield Stats</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Queued</span>
                <span className="font-medium text-foreground">{queuedNotifications.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${shieldActive ? 'text-mode-primary' : 'text-muted-foreground'}`}>
                  {shieldActive ? 'Protecting' : 'Paused'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Queued Notifications */}
      <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-mode-primary" />
            <h3 className="font-display font-semibold text-foreground">
              Queued Notifications ({queuedNotifications.length})
            </h3>
          </div>
          {queuedNotifications.length > 0 && (
            <button onClick={clearNotifications} className="text-xs text-destructive hover:underline flex items-center gap-1">
              <Trash2 size={12} /> Clear All
            </button>
          )}
        </div>

        {queuedNotifications.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <BellOff size={28} className="mx-auto mb-3 opacity-30" />
            <p className="font-display">No queued notifications</p>
            <p className="text-xs mt-1">Notifications blocked by the shield will appear here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {queuedNotifications.map((n, i) => (
              <motion.div
                key={n.id}
                className="p-3 rounded-xl bg-secondary/40 flex items-start gap-3 hover:bg-secondary/60 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="w-8 h-8 rounded-lg bg-mode-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell size={14} className="text-mode-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.body}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
