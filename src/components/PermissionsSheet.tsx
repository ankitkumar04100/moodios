import { useEmotionStore } from '@/stores/emotionStore';
import { Camera, Mic, Bell, Monitor, ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface PermissionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PermissionsSheet({ open, onOpenChange }: PermissionsSheetProps) {
  const { permissions, setPermission, setSensingMode } = useEmotionStore();

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
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

  const enableRealSensing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 } },
        audio: true,
      });
      stream.getTracks().forEach((t) => t.stop());
      setPermission('camera', 'granted');
      setPermission('microphone', 'granted');
      setSensingMode('real');
      onOpenChange(false);
    } catch {
      setPermission('camera', 'denied');
      setPermission('microphone', 'denied');
      setSensingMode('simulation');
    }
  };

  const statusIcon = (state: string) => {
    if (state === 'granted') return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (state === 'denied') return <XCircle size={16} className="text-destructive" />;
    return <AlertCircle size={16} className="text-amber-500" />;
  };

  const statusLabel = (state: string) => {
    if (state === 'granted') return 'Granted';
    if (state === 'denied') return 'Denied';
    if (state === 'not-requested') return 'Not requested';
    return state;
  };

  const items = [
    {
      key: 'camera' as const,
      icon: Camera,
      label: 'Camera',
      desc: 'Face landmarks for micro-expression detection. Processed locally.',
      action: requestCamera,
    },
    {
      key: 'microphone' as const,
      icon: Mic,
      label: 'Microphone',
      desc: 'Voice prosody analysis (pitch, energy). No audio is recorded.',
      action: requestMic,
    },
    {
      key: 'notifications' as const,
      icon: Bell,
      label: 'Notifications',
      desc: 'Mood-aware notifications filtered by your emotional state.',
      action: requestNotifications,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-background border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Sensor Permissions</SheetTitle>
          <SheetDescription>
            All processing happens locally on your device. No data is sent to any server.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          <button
            onClick={enableRealSensing}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-mode-primary/20 to-mode-glow/20 border border-mode-primary/30 text-left hover:from-mode-primary/30 hover:to-mode-glow/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mode-primary/20 flex items-center justify-center">
                <Monitor size={20} className="text-mode-primary" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground text-sm">Enable Real Sensing</p>
                <p className="text-xs text-muted-foreground">Grant camera + mic for live emotion detection</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground ml-auto" />
            </div>
          </button>

          {items.map(({ key, icon: Icon, label, desc, action }) => {
            const state = permissions[key] as string;
            return (
              <div
                key={key}
                className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-mode-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} className="text-mode-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{label}</p>
                      {statusIcon(state)}
                      <span className="text-xs text-muted-foreground">{statusLabel(state)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                    {state === 'denied' && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Open browser settings → Site Settings → re-enable {label.toLowerCase()}
                      </p>
                    )}
                  </div>
                  {(state === 'not-requested' || state === 'prompt') && (
                    <button
                      onClick={action}
                      className="px-3 py-1.5 text-xs rounded-lg bg-mode-primary/15 text-mode-primary font-medium hover:bg-mode-primary/25 transition-colors shrink-0"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-secondary/50 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">🔒 Privacy Guarantee</p>
          <p>All emotion detection runs entirely on your device using MediaPipe and Web Audio API. No images, audio, or raw data ever leaves your browser.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
