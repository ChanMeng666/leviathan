import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../components/ui/TypewriterText';
import { useGameStore } from '../stores';

interface MainMenuProps {
  onStart: () => void;
}

export function MainMenu({ onStart }: MainMenuProps) {
  const [showIntro, setShowIntro] = useState(true);
  const day = useGameStore((s) => s.day);
  const resetNation = useGameStore((s) => s.resetNation);
  const resetCards = useGameStore((s) => s.resetCards);
  const resetEvents = useGameStore((s) => s.resetEvents);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetNarratives = useGameStore((s) => s.resetNarratives);

  const hasSave = day > 0;

  const handleNewGame = () => {
    resetNation();
    resetCards();
    resetEvents();
    resetNarratives();
    resetGame();
    onStart();
  };

  const handleContinue = () => {
    onStart();
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="max-w-lg w-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="text-terminal-green glow-green text-2xl mb-1 font-bold">
            利维坦的诞生
          </div>
          <div className="text-terminal-dim text-sm mb-6">
            The Birth of Leviathan
          </div>
        </motion.div>

        {showIntro && (
          <motion.div
            className="text-terminal-dim text-xs mb-8 leading-relaxed max-w-sm mx-auto"
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
        )}

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button
            className="w-full border border-terminal-green text-terminal-green py-2 px-4 hover:bg-terminal-green/10 glow-green text-sm"
            onClick={handleNewGame}
          >
            [ 新游戏 — 发明一个民族 ]
          </button>

          {hasSave && (
            <button
              className="w-full border border-terminal-yellow text-terminal-yellow py-2 px-4 hover:bg-terminal-yellow/10 text-sm"
              onClick={handleContinue}
            >
              [ 继续 — Day {day} ]
            </button>
          )}
        </motion.div>

        <motion.div
          className="mt-8 text-terminal-dim text-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          "任何叙事都能构建——历史、民族、国家皆可被发明"
          <br />
          <span className="text-terminal-dim/50">v0.1.0 | Black Humor Political Simulator</span>
        </motion.div>
      </div>
    </div>
  );
}
