import { motion } from 'framer-motion';
import type { GameRunRecord } from '@leviathan/shared';
import { GOVERNMENT_LABELS } from '@leviathan/shared';
import type { GovernmentType } from '@leviathan/shared';

const DEATH_LABELS: Record<string, string> = {
  riot: '暴乱覆灭',
  starvation: '饥荒亡国',
  insanity: '精神崩溃',
};

const VICTORY_LABELS: Record<string, string> = {
  gold: '利维坦升天',
  silver: '苟延残喘',
  bronze: '惨胜',
};

const OUTCOME_COLORS: Record<string, string> = {
  riot: 'border-red/60',
  starvation: 'border-orange/60',
  insanity: 'border-teal/60',
  gold: 'border-gold/60',
  silver: 'border-dim/60',
  bronze: 'border-orange/60',
};

const OUTCOME_TAG_COLORS: Record<string, string> = {
  riot: 'bg-red/20 text-red',
  starvation: 'bg-orange/20 text-orange',
  insanity: 'bg-teal/20 text-teal',
  gold: 'bg-gold/20 text-gold',
  silver: 'bg-dim/20 text-dim',
  bronze: 'bg-orange/20 text-orange',
};

interface GalleryCardProps {
  run: GameRunRecord;
  index: number;
  onClick: () => void;
}

export function GalleryCard({ run, index, onClick }: GalleryCardProps) {
  const outcomeKey = run.victoryType ?? run.deathReason ?? '';
  const outcomeLabel = run.victoryType
    ? VICTORY_LABELS[run.victoryType] ?? '胜利'
    : DEATH_LABELS[run.deathReason ?? ''] ?? '未知';
  const borderColor = OUTCOME_COLORS[outcomeKey] ?? 'border-dim/40';
  const tagColor = OUTCOME_TAG_COLORS[outcomeKey] ?? 'bg-dim/20 text-dim';
  const govLabel = GOVERNMENT_LABELS[run.governmentType as GovernmentType] ?? '未知';
  const date = new Date(run.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.button
      className={`card-face w-full text-left p-4 border-2 ${borderColor} rounded-[var(--radius-lg)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-shadow cursor-pointer`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-accent font-bold text-sm truncate flex-1">{run.nationName}</div>
        <span className={`pill-tag text-[10px] shrink-0 ${tagColor}`}>
          {outcomeLabel}
        </span>
      </div>

      {run.epitaph && (
        <div className="text-fg/60 text-xs mb-3 line-clamp-2 italic">
          "{run.epitaph}"
        </div>
      )}

      <div className="flex items-center gap-3 text-[10px] text-dim font-mono">
        <span>纪元 {run.erasSurvived}</span>
        <span className="text-fg/30">|</span>
        <span>{govLabel}</span>
        <span className="text-fg/30">|</span>
        <span className="text-gold">{run.totalScore.toLocaleString()} 分</span>
      </div>

      <div className="text-[10px] text-dim/60 mt-2">{date}</div>
    </motion.button>
  );
}
