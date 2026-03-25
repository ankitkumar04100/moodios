import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

export default function InstallBanner() {
  const { canInstall, isInstalled, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || isInstalled || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-14 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl p-3 px-4 flex items-center gap-3 max-w-sm"
      >
        <Download size={16} className="text-mode-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">Install MoodiOS</p>
          <p className="text-[10px] text-muted-foreground">Add to home screen for the best experience</p>
        </div>
        <button
          onClick={install}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-mode-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
        >
          Install
        </button>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-1">
          <X size={12} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
