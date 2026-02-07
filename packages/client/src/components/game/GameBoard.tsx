import { useState } from 'react';
import { useGameStore } from '../../stores';
import { StatsPanel } from './StatsPanel';
import { CardHand } from './CardHand';
import { NarrativeLoom } from './NarrativeLoom';
import { NarrativeLog } from './NarrativeLog';
import { EventDialog } from './EventDialog';
import { GameOverScreen } from './GameOverScreen';
import { PrologueScreen } from './PrologueScreen';
import { ScapegoatWheel } from './ScapegoatWheel';
import { HistoryBook } from './HistoryBook';
import { UserMenu } from '../auth/UserMenu';
import { SaveManager } from '../auth/SaveManager';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AudioSettingsButton } from '../ui/AudioSettings';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useCloudSaves } from '../../hooks/useCloudSaves';
import { useSfx } from '../../hooks/useAudio';

export function GameBoard() {
  const phase = useGameStore((s) => s.phase);
  const day = useGameStore((s) => s.day);
  const gameOver = useGameStore((s) => s.gameOver);
  const nation = useGameStore((s) => s.nation);
  const user = useGameStore((s) => s.user);
  const setScreen = useGameStore((s) => s.setScreen);

  const { advanceDay, endActionPhase } = useGameLoop();
  const { saveGame } = useCloudSaves();
  const { play: sfx } = useSfx();

  const [showScapegoat, setShowScapegoat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const unsat = Math.max(0, 100 - nation.narrative_integrity - nation.violence_authority);

  const handleBackToMenu = () => {
    sfx('btn-click');
    setShowBackConfirm(true);
  };

  const confirmBack = () => {
    if (user) {
      saveGame('自动存档').catch(() => {});
    }
    setScreen('welcome');
  };

  if (phase === 'prologue') return <PrologueScreen />;
  if (gameOver) return <GameOverScreen />;

  return (
    <div className="h-screen flex flex-col felt-bg">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-surface/50">
        <div className="flex items-center gap-3">
          <button
            className="btn-secondary text-xs px-3 py-1"
            onClick={handleBackToMenu}
          >
            &larr; 菜单
          </button>
          <div className="flex items-center gap-2 text-accent text-sm font-bold">
            <img src="/leviathan-logo.svg" alt="" className="w-6 h-6" />
            利维坦的诞生 <span className="text-dim font-mono text-xs ml-2">第 {day} 天</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {unsat > 50 && (
            <button
              className="btn-danger text-xs px-3 py-1"
              onClick={() => { sfx('btn-click'); setShowScapegoat(true); }}
            >
              替罪羊轮盘
            </button>
          )}
          <button
            className="btn-secondary text-xs px-3 py-1"
            onClick={() => { sfx('btn-click'); setShowHistory(true); }}
          >
            历史档案
          </button>
          <UserMenu onOpenSaveManager={() => setShowSaveManager(true)} />
          <AudioSettingsButton />
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
              onClick={() => { sfx('phase-change'); endActionPhase(); }}
            >
              结束行动
            </button>
          )}
          {(phase === 'draw' || phase === 'settle') && (
            <button
              className="btn-primary text-xs px-4 py-1.5"
              onClick={() => { sfx('day-advance'); advanceDay(); }}
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

      {/* Save manager */}
      <SaveManager open={showSaveManager} onClose={() => setShowSaveManager(false)} />

      {/* Back to menu confirm */}
      <ConfirmDialog
        open={showBackConfirm}
        onClose={() => setShowBackConfirm(false)}
        onConfirm={confirmBack}
        title="返回主菜单"
        message="返回主菜单？当前进度已自动保存。"
        confirmText="返回"
      />
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: string }) {
  const styles: Record<string, string> = {
    prologue: 'bg-gold/20 text-gold',
    draw: 'bg-blue/20 text-blue',
    action: 'bg-teal/20 text-teal',
    event: 'bg-red/20 text-red',
    settle: 'bg-gold/20 text-gold',
    gameover: 'bg-red/20 text-red',
  };
  const labels: Record<string, string> = {
    prologue: '序章',
    draw: '抽牌',
    action: '行动',
    event: '事件',
    settle: '结算',
    gameover: '死亡',
  };
  return (
    <span className={`phase-chip ${styles[phase] ?? 'bg-surface text-dim'}`}>
      {labels[phase] ?? '未知'}
    </span>
  );
}
