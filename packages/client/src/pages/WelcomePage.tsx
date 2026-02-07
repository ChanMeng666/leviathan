import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from '../components/ui/TypewriterText';
import { BalatroBackground } from '../components/ui/BalatroBackground';
import { AuthModal } from '../components/auth/AuthModal';
import { SaveList } from '../components/auth/SaveList';
import { SaveManager } from '../components/auth/SaveManager';
import { AudioSettingsButton } from '../components/ui/AudioSettings';
import { useGameStore } from '../stores';
import { useAuth } from '../hooks/useAuth';
import { useCloudSaves } from '../hooks/useCloudSaves';
import { useSfx } from '../hooks/useAudio';
import { audioManager } from '../lib/audioManager';

// Skip entry gate on subsequent visits within the same browser session
let sessionAudioUnlocked = false;

export function WelcomePage() {
  const day = useGameStore((s) => s.day);
  const setScreen = useGameStore((s) => s.setScreen);
  const resetNation = useGameStore((s) => s.resetNation);
  const resetCards = useGameStore((s) => s.resetCards);
  const resetEvents = useGameStore((s) => s.resetEvents);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetNarratives = useGameStore((s) => s.resetNarratives);

  const { user, signOut } = useAuth();
  const { saves, isLoading, fetchSaves, loadSave, deleteSave } = useCloudSaves();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showSaveManager, setShowSaveManager] = useState(false);

  const { play: sfx } = useSfx();
  const hasSave = day > 0;

  const [audioUnlocked, setAudioUnlocked] = useState(sessionAudioUnlocked);

  const handleEntryClick = useCallback(() => {
    audioManager.resumeContext();
    audioManager.preloadEssentialSfx();
    // Small delay so AudioContext has time to resume before BGM starts
    setTimeout(() => audioManager.ensurePlaying(), 100);
    sessionAudioUnlocked = true;
    setAudioUnlocked(true);
  }, []);

  // Fetch cloud saves when user is logged in
  useEffect(() => {
    if (user) fetchSaves();
  }, [user, fetchSaves]);

  const handleNewGame = () => {
    resetNation();
    resetCards();
    resetEvents();
    resetNarratives();
    resetGame();
    // resetGame sets screen to 'welcome', so override to 'game'
    setScreen('game');
  };

  const handleContinue = () => {
    setScreen('game');
  };

  const handleLoadSave = useCallback(async (id: string) => {
    try {
      await loadSave(id);
      // loadSave calls loadGame which sets screen: 'game'
    } catch {
      // Error handled silently
    }
  }, [loadSave]);

  const handleDeleteSave = useCallback(async (id: string) => {
    try {
      await deleteSave(id);
      // If that was the last cloud save, also clear local state
      if (saves.length <= 1) {
        resetNation();
        resetCards();
        resetEvents();
        resetNarratives();
        resetGame();
      }
    } catch {
      // Error handled silently
    }
  }, [deleteSave, saves.length, resetNation, resetCards, resetEvents, resetNarratives, resetGame]);

  const openLogin = () => {
    setAuthTab('login');
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthTab('register');
    setShowAuthModal(true);
  };

  // Show up to 3 recent saves on welcome page
  const recentSaves = saves.slice(0, 3);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-y-auto">
      <BalatroBackground className="z-0" />

      {/* Top-right audio settings */}
      <div className="fixed top-4 right-4 z-20">
        <AudioSettingsButton direction="down" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center px-4 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
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

        {/* Main buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
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
              继续 — 第 {day} 天
            </button>
          )}

          <button
            className="btn-secondary w-full text-sm py-3"
            onClick={() => { sfx('btn-click'); setScreen('gallery'); }}
          >
            结局画廊
          </button>
        </motion.div>

        {/* Cloud saves section (logged in only) */}
        {user && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <div className="panel p-4 max-h-[240px] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-accent font-semibold">云存档</span>
                {saves.length > 3 && (
                  <button
                    className="text-xs text-dim hover:text-accent transition-colors"
                    onClick={() => setShowSaveManager(true)}
                  >
                    查看全部存档
                  </button>
                )}
              </div>
              <SaveList
                saves={recentSaves}
                isLoading={isLoading}
                onLoad={handleLoadSave}
                onDelete={handleDeleteSave}
                compact
              />
            </div>
          </motion.div>
        )}

        {/* Account status */}
        <motion.div
          className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {user ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent text-bg text-xs font-bold flex items-center justify-center">
                {(user.name ?? user.email)?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm text-fg/70">{user.name ?? user.email}</span>
              <button
                className="text-xs text-dim hover:text-red transition-colors"
                onClick={signOut}
              >
                退出登录
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <button
                className="text-sm text-accent hover:underline transition-colors"
                onClick={openLogin}
              >
                登录
              </button>
              <span className="text-dim text-xs">|</span>
              <button
                className="text-sm text-accent hover:underline transition-colors"
                onClick={openRegister}
              >
                注册
              </button>
              <span className="text-dim text-xs ml-1">启用云存档</span>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-fg/40 text-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          "任何叙事都能构建——历史、民族、国家皆可被发明"
          <br />
          <span className="text-fg/25">v0.1.0</span>
        </motion.div>

        {/* Developer branding */}
        <motion.div
          className="mt-6 pt-5 border-t border-fg/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <img
              src="/chan_logo.svg"
              alt="Chan Meng"
              className="w-6 h-6"
              style={{ filter: 'invert(1)', opacity: 0.5 }}
            />
            <span className="text-fg/50 text-[11px]">
              由 <span className="text-accent/80 font-semibold">Chan Meng</span> 设计开发
            </span>
          </div>
          <p className="text-fg/30 text-[10px] mb-2.5 leading-relaxed max-w-xs mx-auto">
            需要定制网站或Web应用？欢迎联系开发者
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px]">
            <a
              href="mailto:chanmeng.dev@gmail.com"
              className="text-fg/40 hover:text-accent transition-colors"
              title="联系开发者"
            >
              chanmeng.dev@gmail.com
            </a>
            <span className="text-fg/15">|</span>
            <a
              href="https://github.com/ChanMeng666"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg/40 hover:text-accent transition-colors"
              title="开发者作品集"
            >
              GitHub
            </a>
            <span className="text-fg/15">|</span>
            <a
              href="https://github.com/ChanMeng666/leviathan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg/40 hover:text-accent transition-colors"
              title="项目源码"
            >
              源码
            </a>
          </div>
        </motion.div>
      </div>

      {/* Auth modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={authTab}
      />

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
