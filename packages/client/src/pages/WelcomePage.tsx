import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from '../components/ui/TypewriterText';
import { BalatroBackground } from '../components/ui/BalatroBackground';
import { InlineAuthForm } from '../components/auth/InlineAuthForm';
import { SaveManager } from '../components/auth/SaveManager';
import { AudioSettingsButton } from '../components/ui/AudioSettings';
import { InfoMenuButton } from '../components/ui/InfoMenuButton';
import { UserMenu } from '../components/auth/UserMenu';
import { useGameStore } from '../stores';
import { useAuth } from '../hooks/useAuth';
import { useSfx } from '../hooks/useAudio';
import { audioManager } from '../lib/audioManager';

// Skip entry gate on subsequent visits within the same browser session
let sessionAudioUnlocked = false;

export function WelcomePage() {
  const crisisState = useGameStore((s) => s.crisisState);
  const phase = useGameStore((s) => s.phase);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetNation = useGameStore((s) => s.resetNation);
  const resetCards = useGameStore((s) => s.resetCards);
  const resetEvents = useGameStore((s) => s.resetEvents);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetNarratives = useGameStore((s) => s.resetNarratives);
  const resetShop = useGameStore((s) => s.resetShop);

  const { user } = useAuth();

  const [showSaveManager, setShowSaveManager] = useState(false);

  const { play: sfx } = useSfx();
  const hasSave = crisisState.era >= 1 && phase !== 'prologue';

  const [audioUnlocked, setAudioUnlocked] = useState(sessionAudioUnlocked);

  const handleEntryClick = useCallback(() => {
    audioManager.resumeContext();
    audioManager.preloadEssentialSfx();
    // Small delay so AudioContext has time to resume before BGM starts
    setTimeout(() => audioManager.ensurePlaying(), 100);
    sessionAudioUnlocked = true;
    setAudioUnlocked(true);
  }, []);

  const handleNewGame = () => {
    if (!user) return;
    resetNation();
    resetCards();
    resetEvents();
    resetNarratives();
    resetShop();
    resetGame();
    // resetGame sets screen to 'welcome', so override to 'game'
    setScreen('game');
  };

  const handleContinue = () => {
    if (!user) return;
    setScreen('game');
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden">
      <BalatroBackground className="z-0" />

      {/* Top-right toolbar */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
        {user && (
          <UserMenu onOpenSaveManager={() => setShowSaveManager(true)} />
        )}
        <AudioSettingsButton direction="down" />
        <InfoMenuButton />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src="/leviathan-logo.svg"
            alt="利维坦的诞生"
            className="w-24 h-24 mx-auto mb-3 drop-shadow-lg"
          />
          <div className="text-accent text-3xl mb-1 font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            利维坦的诞生
          </div>
          <div className="text-fg/60 text-sm mb-6">
            黑色幽默政治模拟器
          </div>
        </motion.div>

        {/* Typewriter intro */}
        <motion.div
          className="text-fg/70 text-xs mb-8 leading-relaxed max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <TypewriterText
            text="旧帝国崩溃了。在废墟中，你捡起了一些垃圾——半个馒头、一尊塑料关公像、一台没有插线的红色电话机。用这些素材，你将编造神话、发明历史、构建一个前所未有的民族。活下来就是一切。"
            speed={35}
            onComplete={() => {}}
          />
        </motion.div>

        {/* Main content: auth form or game buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {user ? (
            <div className="space-y-3">
              <button
                className="btn-primary w-full text-sm py-3"
                onClick={() => { sfx('btn-click'); handleNewGame(); }}
              >
                新游戏 — 发明一个民族
              </button>

              {hasSave && (
                <button
                  className="btn-secondary w-full text-sm py-3"
                  onClick={() => { sfx('btn-click'); handleContinue(); }}
                >
                  继续 — 纪元 {crisisState.era}
                </button>
              )}

              <button
                className="btn-secondary w-full text-sm py-3"
                onClick={() => { if (!user) return; sfx('btn-click'); setScreen('gallery'); }}
              >
                结局画廊
              </button>
            </div>
          ) : (
            <InlineAuthForm onSuccess={() => {}} />
          )}
        </motion.div>
      </div>

      {/* Full save manager modal */}
      <SaveManager open={showSaveManager} onClose={() => setShowSaveManager(false)} />

      {/* Entry gate — provides user gesture to unlock AudioContext */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div
            key="entry-gate"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
            onClick={handleEntryClick}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BalatroBackground className="z-0" />
            <div className="relative z-10 text-center">
              <img
                src="/leviathan-logo.svg"
                alt="利维坦的诞生"
                className="w-32 h-32 mx-auto mb-4 drop-shadow-lg"
              />
              <div
                className="text-accent text-4xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                利维坦的诞生
              </div>
              <div className="text-fg/50 text-sm animate-pulse">
                点击任意位置开始
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
