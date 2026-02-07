import { motion } from 'framer-motion';
import { useGameStore } from '../../stores';
import { getEra, getBossModifier } from '@leviathan/shared';
import { BalatroBackground } from '../ui/BalatroBackground';

const CRISIS_LABELS = { small: '小危机', big: '大危机', boss: 'Boss' };

interface Props { onContinue: () => void; }

export function CrisisStartScreen({ onContinue }: Props) {
  const crisisState = useGameStore((s) => s.crisisState);
  const era = getEra(crisisState.era);
  const bossModifier = crisisState.bossModifier ? getBossModifier(crisisState.bossModifier) : null;

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      <BalatroBackground className="z-0" />
      <div className="relative z-10 max-w-lg w-full text-center px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-dim text-xs mb-2">纪元 {crisisState.era}</div>
          <div className="text-gold text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {era?.name ?? `纪元${crisisState.era}`}
          </div>
          <div className="text-accent text-lg mb-4">
            {CRISIS_LABELS[crisisState.crisisType]} {crisisState.crisisIndex + 1}/3
          </div>
        </motion.div>

        <motion.div className="panel p-6 mb-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <div className="text-dim text-xs mb-1">目标宣传力</div>
          <div className="text-gold text-4xl font-bold font-mono mb-3">
            {crisisState.targetScore.toLocaleString()}
          </div>
          <div className="flex justify-center gap-4 text-xs text-dim mb-2">
            <span>纺织次数: {crisisState.weavesRemaining}</span>
            <span>弃牌次数: {crisisState.discardsRemaining}</span>
          </div>
          <div className="flex justify-center gap-1 mb-3">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className={`text-xl ${i < crisisState.lives ? 'text-red' : 'text-dim/30'}`}>♥</span>
            ))}
          </div>
          {bossModifier && (
            <div className="bg-red/10 border border-red/30 rounded-[var(--radius-sm)] p-3 text-left">
              <div className="text-red text-sm font-bold mb-1">Boss 限制: {bossModifier.name}</div>
              <div className="text-xs text-fg/70">{bossModifier.description}</div>
            </div>
          )}
        </motion.div>

        <motion.button
          className="btn-primary px-8 py-3 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onContinue}
        >
          开始纺织
        </motion.button>
      </div>
    </div>
  );
}
