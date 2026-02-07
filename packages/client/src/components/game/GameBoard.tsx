import { useState } from 'react';
import { useGameStore } from '../../stores';
import { StatsPanel } from './StatsPanel';
import { CardHand } from './CardHand';
import { NarrativeLoom } from './NarrativeLoom';
import { NarrativeLog } from './NarrativeLog';
import { EventDialog } from './EventDialog';
import { GameOverScreen } from './GameOverScreen';
import { PrologueScreen } from './PrologueScreen';
import { CrisisStartScreen } from './CrisisStartScreen';
import { CrisisEndScreen } from './CrisisEndScreen';
import { ShopScreen } from './ShopScreen';
import { VictoryScreen } from './VictoryScreen';
import { DecreeBar } from './DecreeBar';
import { ScoreDisplay } from './ScoreDisplay';
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
  const gameOver = useGameStore((s) => s.gameOver);
  const nation = useGameStore((s) => s.nation);
  const crisisState = useGameStore((s) => s.crisisState);
  const user = useGameStore((s) => s.user);
  const setScreen = useGameStore((s) => s.setScreen);

  const { beginWeavePhase, endCrisis, afterCrisisEnd, afterShop, afterEraTransition } = useGameLoop();
  const { saveGame } = useCloudSaves();
  const { play: sfx } = useSfx();

  const [showHistory, setShowHistory] = useState(false);
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const handleBackToMenu = () => {
    sfx('btn-click');
    setShowBackConfirm(true);
  };

  const confirmBack = () => {
    if (user) saveGame('自动存档').catch(() => {});
    setScreen('welcome');
  };

  // Full-screen phases
  if (phase === 'prologue') return <PrologueScreen />;
  if (phase === 'victory') return <VictoryScreen />;
  if (gameOver) return <GameOverScreen />;
  if (phase === 'crisis_start') return <CrisisStartScreen onContinue={() => { sfx('phase-change'); beginWeavePhase(); }} />;
  if (phase === 'crisis_end') return <CrisisEndScreen onContinue={() => { sfx('phase-change'); afterCrisisEnd(); }} />;
  if (phase === 'shop') return <ShopScreen onContinue={() => { sfx('phase-change'); afterShop(); }} />;

  // Weave phase (+ era_transition overlay)
  return (
    <div className="h-screen flex flex-col felt-bg">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-surface/50">
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-xs px-3 py-1" onClick={handleBackToMenu}>
            &larr; 菜单
          </button>
          <div className="flex items-center gap-2 text-accent text-sm font-bold">
            <img src="/leviathan-logo.svg" alt="" className="w-6 h-6" />
            利维坦的诞生
          </div>
          <span className="text-dim text-xs font-mono">
            纪元{crisisState.era} · {crisisState.crisisType === 'small' ? '小危机' : crisisState.crisisType === 'big' ? '大危机' : 'Boss'}
          </span>
          <div className="flex gap-0.5 ml-2">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className={`text-sm ${i < crisisState.lives ? 'text-red' : 'text-dim/30'}`}>♥</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button className="btn-secondary text-xs px-3 py-1" onClick={() => { sfx('btn-click'); setShowHistory(true); }}>
            历史档案
          </button>
          <UserMenu onOpenSaveManager={() => setShowSaveManager(true)} />
          <AudioSettingsButton />
          <PhaseIndicator phase={phase} />
        </div>
      </div>

      {/* Decree bar */}
      <DecreeBar />

      {/* Three-column layout */}
      <div className="flex-1 grid grid-cols-[280px_1fr_260px] gap-0 min-h-0">
        <div className="overflow-hidden">
          <CardHand />
        </div>
        <div className="border-x border-border flex flex-col p-3 gap-3 min-h-0">
          <NarrativeLoom />
          <NarrativeLog />
        </div>
        <div className="overflow-hidden">
          <StatsPanel />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="border-t border-border px-4 py-2 flex justify-between items-center bg-surface/50">
        <div className="text-xs text-dim font-mono">
          纺织: {crisisState.weavesRemaining}/3 | 弃牌: {crisisState.discardsRemaining}/2 | 得分: {crisisState.roundScore.toLocaleString()} / {crisisState.targetScore.toLocaleString()}
        </div>
        <div className="flex gap-2">
          <button
            className="btn-primary text-xs px-4 py-1.5"
            onClick={() => { sfx('phase-change'); endCrisis(); }}
          >
            结束纺织
          </button>
        </div>
      </div>

      {/* Score cascade animation */}
      <ScoreDisplay />

      {/* Event overlay for era_transition */}
      <EventDialog onResolve={afterEraTransition} />

      <HistoryBook open={showHistory} onClose={() => setShowHistory(false)} />
      <SaveManager open={showSaveManager} onClose={() => setShowSaveManager(false)} />
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
    crisis_start: 'bg-red/20 text-red',
    weave: 'bg-teal/20 text-teal',
    crisis_end: 'bg-gold/20 text-gold',
    shop: 'bg-blue/20 text-blue',
    era_transition: 'bg-purple/20 text-purple',
    victory: 'bg-gold/20 text-gold',
    gameover: 'bg-red/20 text-red',
  };
  const labels: Record<string, string> = {
    prologue: '序章', crisis_start: '危机', weave: '纺织', crisis_end: '结算',
    shop: '黑市', era_transition: '纪元', victory: '胜利', gameover: '死亡',
  };
  return (
    <span className={`phase-chip ${styles[phase] ?? 'bg-surface text-dim'}`}>
      {labels[phase] ?? '未知'}
    </span>
  );
}
