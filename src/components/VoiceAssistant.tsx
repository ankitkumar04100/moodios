import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore } from '@/stores/emotionStore';
import { MessageCircle, X, ArrowRight } from 'lucide-react';

export default function VoiceAssistant() {
  const { voicePrompt, setVoicePrompt, setMoodOverride } = useEmotionStore();
  
  const handleAccept = () => {
    if (voicePrompt) {
      setMoodOverride(voicePrompt.mood === 'stressed' ? 'calm' : voicePrompt.mood === 'overwhelmed' ? 'calm' : null);
    }
    setVoicePrompt(null);
  };
  
  const handleDismiss = () => {
    setVoicePrompt(null);
  };
  
  return (
    <AnimatePresence>
      {voicePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
        >
          <div className="glass rounded-2xl p-4 shadow-2xl border border-mode-primary/20">
            <div className="flex items-start gap-3">
              <motion.div
                className="w-10 h-10 rounded-full bg-mode-primary/15 flex items-center justify-center shrink-0"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MessageCircle size={18} className="text-mode-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-mode-primary font-display font-semibold uppercase tracking-wider">MoodiOS Assistant</p>
                <p className="text-sm text-foreground mt-1 leading-relaxed">{voicePrompt.message}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAccept}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-mode-primary/15 text-mode-primary hover:bg-mode-primary/25 transition-colors"
                  >
                    Yes, please <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
