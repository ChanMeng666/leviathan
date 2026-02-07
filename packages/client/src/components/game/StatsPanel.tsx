import { useRef, useEffect } from 'react';
import { useGameStore } from '../../stores';
import { ProgressBar } from '../ui/ProgressBar';
import { GOVERNMENT_LABELS, GOVERNMENT_DESCRIPTIONS } from '@leviathan/shared';
import { audioManager } from '../../lib/audioManager';

export function StatsPanel() {
  const nation = useGameStore((s) => s.nation);
  const crisisState = useGameStore((s) => s.crisisState);
  const influence = useGameStore((s) => s.influence);

  const prevStats = useRef({ power: nation.power, supply: nation.supply, sanity: nation.sanity });
  const dangerTriggered = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prev = prevStats.current;
    const stats = { power: nation.power, supply: nation.supply, sanity: nation.sanity };
    let hadChange = false;
    let net = 0;

    for (const key of Object.keys(stats) as (keyof typeof stats)[]) {
      const diff = stats[key] - prev[key];
      if (diff !== 0) { hadChange = true; net += diff; }
      if (stats[key] < 20 && prev[key] >= 20 && !dangerTriggered.current.has(key)) {
        dangerTriggered.current.add(key);
        audioManager.playSfx('danger-pulse');
      }
      if (stats[key] >= 20) dangerTriggered.current.delete(key);
    }

    if (hadChange) audioManager.playSfx(net >= 0 ? 'stat-up' : 'stat-down');
    prevStats.current = stats;
  }, [nation.power, nation.supply, nation.sanity]);

  const govLabel = GOVERNMENT_LABELS[nation.government_type] || '未知';
  const govDesc = GOVERNMENT_DESCRIPTIONS[nation.government_type] || '';

  return (
    <div className="panel p-3 h-full overflow-y-auto">
      <div className="text-accent text-center mb-3 border-b border-border pb-2 font-bold">
        {nation.name}
      </div>

      <div className="text-xs text-dim mb-1 text-center font-mono">
        纪元 {crisisState.era} | 人口: {nation.population} | 影响力: {influence}
      </div>
      <div className="text-xs text-center mb-1 font-mono text-gold">
        总分: {crisisState.totalScore.toLocaleString()}
      </div>
      <div className="text-xs text-center mb-3">
        <span className="pill-tag bg-gold/15 text-gold">{govLabel}</span>
        {govDesc && <div className="text-[10px] text-dim mt-1">{govDesc}</div>}
      </div>

      <ProgressBar label="权力" value={nation.power} color="red" />
      <ProgressBar label="物资" value={nation.supply} color="yellow" />
      <ProgressBar label="理智" value={nation.sanity} color="green" />

      <div className="mt-3 pt-2 border-t border-border">
        <ProgressBar label="暴虐" value={nation.tyranny} color="magenta" />
        <ProgressBar label="神话浓度" value={nation.mythDensity} color="cyan" />
      </div>

      {nation.traits.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <div className="text-xs text-dim mb-1">特质:</div>
          <div className="flex flex-wrap gap-1">
            {nation.traits.map((t) => (
              <span key={t} className="pill-tag bg-purple/15 text-purple">{t}</span>
            ))}
          </div>
        </div>
      )}

      {nation.mythology.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <div className="text-xs text-dim mb-1">神话:</div>
          {nation.mythology.map((m) => (
            <div key={m.id} className="text-xs text-gold mb-1 bg-gold/10 border border-gold/20 rounded-[var(--radius-sm)] p-1.5">
              {m.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
