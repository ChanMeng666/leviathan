import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { GameOverReason, HistoryBookResult } from '@leviathan/shared';
import { GOVERNMENT_LABELS } from '@leviathan/shared';
import { useGameStore } from '../../stores';
import { apiFetch } from '../../lib/api';
import { TypewriterText } from '../ui/TypewriterText';
import { BalatroBackground } from '../ui/BalatroBackground';
import { useSfx } from '../../hooks/useAudio';
import type { SfxName } from '../../lib/audioManager';

const hexToGL = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

const DEATH_MESSAGES: Record<GameOverReason, { title: string; text: string }> = {
  riot: {
    title: '暴民推翻了你的政权',
    text: '当权力归零，你精心构建的叙事帝国在一夜之间土崩瓦解。原来，谎言只能在枪口下存活。没有枪的谎言，只是笑话。',
  },
  starvation: {
    title: '你的人民饿死了',
    text: '叙事不能填饱肚子。当最后一粒粮食被分配完毕，你的建国神话在饥饿面前变得一文不值。胃比大脑更诚实。',
  },
  insanity: {
    title: '精神崩溃',
    text: '太多的矛盾叙事在你脑中交战。当理智归零，你坐在办公桌前，盯着那台从未响过的红色电话机，开始哭泣。',
  },
};

export function GameOverScreen() {
  const gameOverReason = useGameStore((s) => s.gameOverReason);
  const nation = useGameStore((s) => s.nation);
  const crisisState = useGameStore((s) => s.crisisState);
  const user = useGameStore((s) => s.user);
  const resetNation = useGameStore((s) => s.resetNation);
  const resetCards = useGameStore((s) => s.resetCards);
  const resetEvents = useGameStore((s) => s.resetEvents);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetNarratives = useGameStore((s) => s.resetNarratives);
  const resetShop = useGameStore((s) => s.resetShop);
  const recordDefeat = useGameStore((s) => s.recordDefeat);

  const [historyBook, setHistoryBook] = useState<HistoryBookResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { play: sfx } = useSfx();
  const recorded = useRef(false);

  const reason = gameOverReason ?? 'riot';
  const deathInfo = DEATH_MESSAGES[reason];

  const DEATH_SFX: Record<GameOverReason, SfxName> = {
    riot: 'death-riot',
    starvation: 'death-starve',
    insanity: 'death-insanity',
  };

  useEffect(() => {
    if (gameOverReason) sfx(DEATH_SFX[gameOverReason]);
  }, [gameOverReason]);

  useEffect(() => {
    if (!gameOverReason || nation.history_log.length === 0) return;

    if (!recorded.current) {
      recorded.current = true;
      recordDefeat(crisisState.era, crisisState.totalScore);

      if (user) {
        apiFetch('/api/saves/record-run', {
          method: 'POST',
          body: JSON.stringify({
            nationName: nation.name,
            erasSurvived: crisisState.era,
            deathReason: reason,
            victoryType: null,
            governmentType: nation.government_type,
            totalScore: crisisState.totalScore,
            finalPopulation: nation.population,
            traits: nation.traits.length > 0 ? nation.traits : null,
            mythology: nation.mythology.length > 0 ? nation.mythology.map((m) => ({ name: m.name, description: m.description })) : null,
            finalStats: { power: nation.power, supply: nation.supply, sanity: nation.sanity, tyranny: nation.tyranny, mythDensity: nation.mythDensity },
            historyLog: nation.history_log.length > 0 ? nation.history_log : null,
          }),
        }).catch((err) => console.error('Record run error:', err));
      }
    }

    setLoading(true);
    fetch('/api/history-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nation_state: { name: nation.name, traits: nation.traits, government_type: nation.government_type, population: nation.population },
        history_log: nation.history_log,
        death_reason: reason,
        eras_survived: crisisState.era,
        total_score: crisisState.totalScore,
      }),
    })
      .then((r) => r.json())
      .then((data: HistoryBookResult) => setHistoryBook(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gameOverReason]);

  const handleRestart = () => {
    resetNation();
    resetCards();
    resetEvents();
    resetNarratives();
    resetShop();
    resetGame();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <BalatroBackground color1={hexToGL('#DE443B')} color2={hexToGL('#3B1C1C')} color3={hexToGL('#0A0A0A')} spinSpeed={0.2} contrast={1.0} className="z-0" />
      <div className="relative z-10 max-w-2xl w-full text-center">
        <motion.div className="flex flex-col items-center mb-4" initial={{ y: -20 }} animate={{ y: 0 }}>
          <img src="/leviathan-logo.svg" alt="" className="w-16 h-16 mb-3 opacity-60 grayscale" />
          <div className="text-red text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>游戏结束</div>
        </motion.div>
        <div className="text-red text-xl mb-2">{deathInfo.title}</div>
        <div className="text-fg/70 text-sm mb-6 max-w-md mx-auto">
          <TypewriterText text={deathInfo.text} speed={25} />
        </div>
        <div className="text-dim text-xs mb-6 font-mono">
          纪元: {crisisState.era} | 总分: {crisisState.totalScore.toLocaleString()} | 政体: {GOVERNMENT_LABELS[nation.government_type] || '未知'}
        </div>
        {loading && <div className="text-gold mb-6">后世历史学家正在撰写评价...</div>}
        {historyBook && (
          <motion.div className="panel-raised p-5 mb-6 text-left border border-gold/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-gold text-center mb-2 font-bold">{historyBook.title}</div>
            <div className="text-sm text-fg mb-3">{historyBook.body}</div>
            <div className="text-xs text-teal italic text-center">"{historyBook.epitaph}"</div>
          </motion.div>
        )}
        <button className="btn-primary px-8 py-3" onClick={() => { sfx('btn-click'); handleRestart(); }}>
          重新开始 — 发明另一个民族
        </button>
      </div>
    </motion.div>
  );
}
