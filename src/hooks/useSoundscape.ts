/**
 * Hook to connect the soundscape engine to the emotion store.
 * Automatically transitions soundscape when activeMood changes.
 */

import { useEffect } from 'react';
import { useEmotionStore } from '@/stores/emotionStore';
import { transitionTo, destroySoundscape } from '@/core/audio/soundscapeEngine'; 

export function useSoundscape() {
  const activeMood = useEmotionStore((s) => s.activeMood);
  const sensingActive = useEmotionStore((s) => s.sensingActive);

  useEffect(() => {
    if (sensingActive) {
      transitionTo(activeMood);
    }
  }, [activeMood, sensingActive]);

  useEffect(() => {
    return () => {
      destroySoundscape();
    };
  }, []);
}
