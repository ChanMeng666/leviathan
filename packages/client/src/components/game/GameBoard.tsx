import { useState } from 'react';
import { useGameStore } from '../../stores';
import { StatsPanel } from './StatsPanel';
import { CardHand } from './CardHand';
import { NarrativeLoom } from './NarrativeLoom';
import { NarrativeLog } from './NarrativeLog';
import { EventDialog } from './EventDialog';
import { GameOverScreen } from './GameOverScreen';
import { ScapegoatWheel } from './ScapegoatWheel';
import { HistoryBook } from './HistoryBook';
import { useGameLoop } from '../../hooks/useGameLoop';

export function GameBoard() {
  const phase = useGameStore((s) => s.phase);
  const day = useGameStore((s) => s.day);
  const gameOver = useGameStore((s) => s.gameOver);
  const nation = useGameStore((s) => s.nation);

  const { advanceDay, endActionPhase } = useGameLoop();

  const [showScapegoat, setShowScapegoat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const unsat = Math.max(0, 100 - nation.narrative_integrity - nation.violence_authority);

  if (gameOver) return <GameOverScreen />;

  return (
    <div className="h-screen flex flex-col felt-bg">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-surface/50">
        <div className="text-accent text-sm font-bold">
          利维坦的诞生 <span className="text-dim font-mono text-xs ml-2">第 {day} 天</span>
        </div>
        <div className="flex gap-2 items-center">
          {unsat > 50 && (
            <button
              className="btn-danger text-xs px-3 py-1"
              onClick={() => setShowScapegoat(true)}
            >
              替罪羊轮盘
            </button>
          )}
          <button
            className="btn-secondary text-xs px-3 py-1"
            onClick={() => setShowHistory(true)}
          >
            历史档案
          </button>
          <PhaseIndicator phase={phase} />
        </div>
      </div>

      {/* Three-column layout */}
      <div className="flex-1 grid grid-cols-[280px_1fr_260px] gap-0 min-h-0">
        {/* Left: Card Hand */}
        <div className="overflow-hidden">
          <CardHand />
        </div>

        {/* Center: Narrative Loom + Log */}
        <div className="border-x border-border flex flex-col p-3 gap-3 min-h-0">
          <NarrativeLoom />
          <NarrativeLog />
        </div>

        {/* Right: Stats Panel */}
        <div className="overflow-hidden">
          <StatsPanel />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="border-t border-border px-4 py-2 flex justify-between items-center bg-surface/50">
        <div className="text-xs text-dim">
          {phase === 'draw' && '点击"下一天"抽取卡牌并进入行动阶段'}
          {phase === 'action' && '选择卡牌投入纺织机，或结束行动阶段'}
          {phase === 'settle' && '日结算完成，点击"下一天"继续'}
          {phase === 'event' && '必须处理当前事件'}
        </div>
        <div className="flex gap-2">
          {phase === 'action' && (
            <button
              className="btn-secondary text-xs px-4 py-1.5"
              onClick={endActionPhase}
            >
              结束行动
            </button>
          )}
          {(phase === 'draw' || phase === 'settle') && (
            <button
              className="btn-primary text-xs px-4 py-1.5"
              onClick={advanceDay}
            >
              下一天
            </button>
          )}
        </div>
      </div>

      {/* Event overlay */}
      <EventDialog />

      {/* Scapegoat wheel */}
      <ScapegoatWheel open={showScapegoat} onClose={() => setShowScapegoat(false)} />

      {/* History book */}
      <HistoryBook open={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: string }) {
  const styles: Record<string, string> = {
    draw: 'bg-blue/20 text-blue',
    action: 'bg-teal/20 text-teal',
    event: 'bg-red/20 text-red',
    settle: 'bg-gold/20 text-gold',
    gameover: 'bg-red/20 text-red',
  };
  const labels: Record<string, string> = {
    draw: '抽牌',
    action: '行动',
    event: '事件',
    settle: '结算',
    gameover: '死亡',
  };
  return (
    <span className={`phase-chip ${styles[phase] ?? 'bg-surface text-dim'}`}>
      {labels[phase] ?? phase}
    </span>
  );
}
