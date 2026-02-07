import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BalatroBackground } from '../components/ui/BalatroBackground';
import { AudioSettingsButton } from '../components/ui/AudioSettings';
import { GalleryGrid } from '../components/gallery/GalleryGrid';
import { useGallery } from '../hooks/useGallery';
import { useGameStore } from '../stores';
import { useSfx } from '../hooks/useAudio';

export function GalleryPage() {
  const setScreen = useGameStore((s) => s.setScreen);
  const { runs, isLoading, fetchRuns } = useGallery();
  const { play: sfx } = useSfx();

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-y-auto">
      <BalatroBackground className="z-0" />

      <div className="relative z-10 w-full max-w-2xl px-4 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            className="text-sm text-dim hover:text-accent transition-colors"
            onClick={() => { sfx('btn-click'); setScreen('welcome'); }}
          >
            ← 返回
          </button>
          <div className="flex items-center gap-2">
            <img src="/leviathan-logo.svg" alt="" className="w-7 h-7" />
            <h1
              className="text-accent text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              结局画廊
            </h1>
          </div>
          <AudioSettingsButton direction="down" />
        </motion.div>

        {/* Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GalleryGrid runs={runs} isLoading={isLoading} />
        </motion.div>

      </div>
    </div>
  );
}
