import { motion } from 'framer-motion';
import type { GameRunRecord } from '@leviathan/shared';
import { GOVERNMENT_LABELS } from '@leviathan/shared';
import type { GovernmentType } from '@leviathan/shared';

const DEATH_LABELS: Record<string, string> = {
  riot: '暴乱覆灭',
  starvation: '饥荒亡国',
  madness: '叙事过载',
  insanity: '精神崩溃',
};

const DEATH_COLORS: Record<string, string> = {
  riot: 'border-red/60',
  starvation: 'border-orange/60',
  madness: 'border-purple/60',
  insanity: 'border-teal/60',
};

const DEATH_TAG_COLORS: Record<string, string> = {
  riot: 'bg-red/20 text-red',
  starvation: 'bg-orange/20 text-orange',
  madness: 'bg-purple/20 text-purple',
  insanity: 'bg-teal/20 text-teal',
};

interface GalleryCardProps {
  run: GameRunRecord;
  index: number;
  onClick: () => void;
}

export function GalleryCard({ run, index, onClick }: GalleryCardProps) {
  const deathLabel = DEATH_LABELS[run.deathReason] ?? run.deathReason;
  const borderColor = DEATH_COLORS[run.deathReason] ?? 'border-dim/40';
  const tagColor = DEATH_TAG_COLORS[run.deathReason] ?? 'bg-dim/20 text-dim';
  const govLabel = GOVERNMENT_LABELS[run.governmentType as GovernmentType] ?? run.governmentType;
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
          {deathLabel}
        </span>
      </div>

      {run.epitaph && (
        <div className="text-fg/60 text-xs mb-3 line-clamp-2 italic">
          "{run.epitaph}"
        </div>
      )}

      <div className="flex items-center gap-3 text-[10px] text-dim font-mono">
        <span>第 {run.daysSurvived} 天</span>
        <span className="text-fg/30">|</span>
        <span>{govLabel}</span>
        <span className="text-fg/30">|</span>
        <span>人口 {run.finalPopulation}</span>
      </div>

      <div className="text-[10px] text-dim/60 mt-2">{date}</div>
    </motion.button>
  );
}
