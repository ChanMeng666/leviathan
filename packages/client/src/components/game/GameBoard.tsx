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
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-terminal-dim px-4 py-2">
        <div className="text-terminal-green glow-green text-sm">
          {'>'} 利维坦的诞生 | Day {day}
        </div>
        <div className="flex gap-2">
          {unsat > 50 && (
            <button
              className="text-xs border border-terminal-red text-terminal-red px-2 py-0.5 hover:bg-terminal-red/10 animate-pulse"
              onClick={() => setShowScapegoat(true)}
            >
              [替罪羊轮盘]
            </button>
          )}
          <button
            className="text-xs border border-terminal-dim text-terminal-dim px-2 py-0.5 hover:text-terminal-fg"
            onClick={() => setShowHistory(true)}
          >
            [历史档案]
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
        <div className="border-x border-terminal-dim flex flex-col p-3 gap-3 min-h-0">
          <NarrativeLoom />
          <NarrativeLog />
        </div>

        {/* Right: Stats Panel */}
        <div className="overflow-hidden">
          <StatsPanel />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="border-t border-terminal-dim px-4 py-2 flex justify-between items-center">
        <div className="text-xs text-terminal-dim">
          {phase === 'draw' && '点击"下一天"抽取卡牌并进入行动阶段'}
          {phase === 'action' && '选择卡牌投入纺织机，或结束行动阶段'}
          {phase === 'settle' && '日结算完成，点击"下一天"继续'}
          {phase === 'event' && '必须处理当前事件'}
        </div>
        <div className="flex gap-2">
          {phase === 'action' && (
            <button
              className="text-xs border border-terminal-yellow text-terminal-yellow px-3 py-1 hover:bg-terminal-yellow/10"
              onClick={endActionPhase}
            >
              [结束行动]
            </button>
          )}
          {(phase === 'draw' || phase === 'settle') && (
            <button
              className="text-xs border border-terminal-green text-terminal-green px-3 py-1 hover:bg-terminal-green/10 glow-green"
              onClick={advanceDay}
            >
              [下一天 &gt;]
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
  const colors: Record<string, string> = {
    draw: 'text-terminal-blue',
    action: 'text-terminal-green',
    event: 'text-terminal-red',
    settle: 'text-terminal-yellow',
    gameover: 'text-terminal-red',
  };
  const labels: Record<string, string> = {
    draw: 'DRAW',
    action: 'ACTION',
    event: 'EVENT',
    settle: 'SETTLE',
    gameover: 'DEAD',
  };
  return (
    <span className={`text-xs ${colors[phase] ?? 'text-terminal-dim'}`}>
      [{labels[phase] ?? phase}]
    </span>
  );
}
