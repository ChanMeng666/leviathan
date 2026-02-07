import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { HistoryBookResult } from '@leviathan/shared';
import { GOVERNMENT_LABELS } from '@leviathan/shared';
import { useGameStore } from '../../stores';
import { apiFetch } from '../../lib/api';
import { TypewriterText } from '../ui/TypewriterText';
import { BalatroBackground } from '../ui/BalatroBackground';
import { useSfx } from '../../hooks/useAudio';

const hexToGL = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

type VictoryTier = 'gold' | 'silver' | 'bronze';

function getVictoryTier(totalScore: number, lives: number): VictoryTier {
  if (totalScore >= 1_000_000) return 'gold';
  if (lives > 0) return 'silver';
  return 'bronze';
}

const TIER_INFO: Record<VictoryTier, { title: string; subtitle: string; colors: [[number, number, number], [number, number, number], [number, number, number]] }> = {
  gold: {
    title: '利维坦升天',
    subtitle: '你的国家已获得自我维持的存在——一个完美的谎言，比真相更真实。',
    colors: [hexToGL('#D4A843'), hexToGL('#8B6914'), hexToGL('#1B2B1B')],
  },
  silver: {
    title: '苟延残喘',
    subtitle: '你的国家勉强存活了下来。没有人欢呼，但也没有人哭泣——这大概就是最好的结局了。',
    colors: [hexToGL('#C0C0C0'), hexToGL('#6B6B6B'), hexToGL('#1B2B1B')],
  },
  bronze: {
    title: '惨胜',
    subtitle: '技术性胜利。你的国家在废墟中诞生，代价是你所拥有的一切。',
    colors: [hexToGL('#CD7F32'), hexToGL('#8B4513'), hexToGL('#1B2B1B')],
  },
};

export function VictoryScreen() {
  const nation = useGameStore((s) => s.nation);
  const crisisState = useGameStore((s) => s.crisisState);
  const user = useGameStore((s) => s.user);
  const resetNation = useGameStore((s) => s.resetNation);
  const resetCards = useGameStore((s) => s.resetCards);
  const resetEvents = useGameStore((s) => s.resetEvents);
  const resetGame = useGameStore((s) => s.resetGame);
  const resetNarratives = useGameStore((s) => s.resetNarratives);
  const resetShop = useGameStore((s) => s.resetShop);
  const recordClear = useGameStore((s) => s.recordClear);

  const [historyBook, setHistoryBook] = useState<HistoryBookResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { play: sfx } = useSfx();
  const recorded = useRef(false);

  const tier = getVictoryTier(crisisState.totalScore, crisisState.lives);
  const tierInfo = TIER_INFO[tier];

  useEffect(() => {
    sfx('btn-click');
  }, []);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;

    recordClear(nation.government_type, 5, crisisState.totalScore);

    if (user) {
      apiFetch('/api/saves/record-run', {
        method: 'POST',
        body: JSON.stringify({
          nationName: nation.name,
          erasSurvived: 5,
          deathReason: null,
          victoryType: tier,
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

    setLoading(true);
    fetch('/api/history-book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nation_state: {
          name: nation.name,
          traits: nation.traits,
          government_type: nation.government_type,
          population: nation.population,
          tyranny: nation.tyranny,
          mythDensity: nation.mythDensity,
        },
        history_log: nation.history_log,
        death_reason: 'victory',
        eras_survived: 5,
        total_score: crisisState.totalScore,
      }),
    })
      .then((r) => r.json())
      .then((data: HistoryBookResult) => setHistoryBook(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRestart = () => {
    resetNation();
    resetCards();
    resetEvents();
    resetNarratives();
    resetShop();
    resetGame();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <BalatroBackground color1={tierInfo.colors[0]} color2={tierInfo.colors[1]} color3={tierInfo.colors[2]} spinSpeed={0.15} contrast={1.2} className="z-0" />
      <div className="relative z-10 max-w-2xl w-full text-center">
        <motion.div className="flex flex-col items-center mb-6" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <img src="/leviathan-logo.svg" alt="" className="w-20 h-20 mb-4" />
          <div className="text-gold text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {tierInfo.title}
          </div>
          <div className="text-fg/70 text-sm max-w-md mx-auto">
            <TypewriterText text={tierInfo.subtitle} speed={20} />
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-3 gap-4 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <div className="panel p-3 text-center">
            <div className="text-dim text-xs mb-1">总分</div>
            <div className="text-gold text-2xl font-mono font-bold">{crisisState.totalScore.toLocaleString()}</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-dim text-xs mb-1">政体</div>
            <div className="text-fg text-lg">{GOVERNMENT_LABELS[nation.government_type] || '未知'}</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-dim text-xs mb-1">剩余生命</div>
            <div className="text-fg text-2xl font-mono">{crisisState.lives}</div>
          </div>
        </motion.div>

        <motion.div className="flex justify-center gap-6 mb-6 text-xs text-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          <span>权力 {nation.power}</span>
          <span>物资 {nation.supply}</span>
          <span>理智 {nation.sanity}</span>
          <span>暴虐 {nation.tyranny}</span>
          <span>神话浓度 {nation.mythDensity}</span>
          <span>人口 {nation.population}</span>
        </motion.div>

        {loading && (
          <div className="text-gold mb-6">后世历史学家正在撰写评价...</div>
        )}

        {historyBook && (
          <motion.div className="panel-raised p-5 mb-6 text-left border border-gold/30" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-gold text-center mb-2 font-bold">{historyBook.title}</div>
            <div className="text-sm text-fg mb-3">{historyBook.body}</div>
            <div className="text-xs text-teal italic text-center">"{historyBook.epitaph}"</div>
          </motion.div>
        )}

        <motion.div className="flex gap-4 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <button className="btn-primary px-8 py-3" onClick={() => { sfx('btn-click'); handleRestart(); }}>
            重新开始 — 发明另一个民族
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
