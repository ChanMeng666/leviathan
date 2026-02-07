import type { GameRunRecord } from '@leviathan/shared';
import { GOVERNMENT_LABELS } from '@leviathan/shared';
import type { GovernmentType } from '@leviathan/shared';
import { Modal } from '../ui/Modal';

const DEATH_LABELS: Record<string, string> = {
  riot: '暴乱覆灭',
  starvation: '饥荒亡国',
  madness: '叙事过载',
  insanity: '精神崩溃',
};

const STAT_CONFIG: { key: string; label: string; color: string }[] = [
  { key: 'narrative_integrity', label: '叙事完整性', color: 'text-blue' },
  { key: 'violence_authority', label: '暴力权威', color: 'text-red' },
  { key: 'supply_level', label: '物资水平', color: 'text-gold' },
  { key: 'sanity', label: '理智', color: 'text-teal' },
  { key: 'cruelty', label: '残酷度', color: 'text-orange' },
  { key: 'corruption', label: '腐败度', color: 'text-purple' },
];

interface GalleryDetailProps {
  run: GameRunRecord | null;
  open: boolean;
  onClose: () => void;
}

export function GalleryDetail({ run, open, onClose }: GalleryDetailProps) {
  if (!run) return null;

  const govLabel = GOVERNMENT_LABELS[run.governmentType as GovernmentType] ?? run.governmentType;
  const deathLabel = DEATH_LABELS[run.deathReason] ?? run.deathReason;

  return (
    <Modal open={open} onClose={onClose} title={run.nationName}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="panel p-3 text-center">
            <div className="text-xs text-dim mb-1">存活天数</div>
            <div className="text-lg font-bold font-mono text-accent">{run.daysSurvived}</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-xs text-dim mb-1">最终人口</div>
            <div className="text-lg font-bold font-mono text-fg">{run.finalPopulation}</div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-xs text-dim mb-1">覆灭原因</div>
            <div className="text-sm font-bold text-red">{deathLabel}</div>
          </div>
        </div>

        {/* Government */}
        <div className="text-center">
          <span className="text-xs text-dim">政体：</span>
          <span className="text-sm font-bold text-gold">{govLabel}</span>
        </div>

        {/* Final stats */}
        {run.finalStats && (
          <div>
            <div className="text-xs text-dim mb-2">最终属性</div>
            <div className="grid grid-cols-3 gap-2">
              {STAT_CONFIG.map(({ key, label, color }) => (
                <div key={key} className="panel p-2 text-center">
                  <div className="text-[10px] text-dim mb-1">{label}</div>
                  <div className={`text-sm font-bold font-mono ${color}`}>
                    {(run.finalStats as Record<string, number>)[key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traits */}
        {run.traits && run.traits.length > 0 && (
          <div>
            <div className="text-xs text-dim mb-2">民族特征</div>
            <div className="flex flex-wrap gap-1">
              {run.traits.map((trait, i) => (
                <span key={i} className="pill-tag text-xs">{trait}</span>
              ))}
            </div>
          </div>
        )}

        {/* Mythology */}
        {run.mythology && run.mythology.length > 0 && (
          <div>
            <div className="text-xs text-dim mb-2">创造的神话</div>
            <div className="space-y-2">
              {run.mythology.map((myth, i) => (
                <div key={i} className="panel p-2">
                  <div className="text-xs font-bold text-accent">{myth.name}</div>
                  <div className="text-xs text-fg/70 mt-1">{myth.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scapegoats */}
        {run.scapegoats && run.scapegoats.length > 0 && (
          <div>
            <div className="text-xs text-dim mb-2">替罪羊</div>
            <div className="flex flex-wrap gap-1">
              {run.scapegoats.map((sg) => (
                <span
                  key={sg.id}
                  className={`pill-tag text-xs ${sg.sacrificed ? 'bg-red/20 text-red line-through' : ''}`}
                >
                  {sg.name}{sg.sacrificed ? '（已献祭）' : ''}
                </span>
              ))}
            </div>
            {run.scapegoats.every((sg) => !sg.sacrificed) && (
              <div className="text-[10px] text-dim/60 mt-1 italic">未献祭任何替罪羊</div>
            )}
          </div>
        )}

        {/* History book */}
        {(run.historyBookTitle || run.historyBookBody || run.epitaph) && (
          <div className="panel-raised p-4 border border-gold/30">
            {run.historyBookTitle && (
              <div className="text-gold text-center mb-2 font-bold text-sm">{run.historyBookTitle}</div>
            )}
            {run.historyBookBody && (
              <div className="text-xs text-fg mb-3 leading-relaxed">{run.historyBookBody}</div>
            )}
            {run.epitaph && (
              <div className="text-xs text-teal italic text-center">"{run.epitaph}"</div>
            )}
          </div>
        )}

        {/* History log */}
        {run.historyLog && run.historyLog.length > 0 && (
          <details className="group">
            <summary className="text-xs text-dim cursor-pointer hover:text-accent transition-colors">
              历史记录（{run.historyLog.length} 条）
            </summary>
            <div className="mt-2 panel p-3 max-h-48 overflow-y-auto space-y-1">
              {run.historyLog.map((entry, i) => (
                <div key={i} className="text-[10px] text-fg/60 leading-relaxed">
                  {entry}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </Modal>
  );
}
