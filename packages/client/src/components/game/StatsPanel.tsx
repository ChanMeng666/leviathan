import { useRef, useEffect } from 'react';
import { useGameStore } from '../../stores';
import { ProgressBar } from '../ui/ProgressBar';
import { GOVERNMENT_LABELS, GOVERNMENT_DESCRIPTIONS } from '@leviathan/shared';
import { audioManager } from '../../lib/audioManager';

export function StatsPanel() {
  const nation = useGameStore((s) => s.nation);
  const day = useGameStore((s) => s.day);
  const scapegoats = useGameStore((s) => s.scapegoats);

  // Track stat changes for sfx
  const prevStats = useRef({
    narrative_integrity: nation.narrative_integrity,
    violence_authority: nation.violence_authority,
    supply_level: nation.supply_level,
    sanity: nation.sanity,
  });
  const dangerTriggered = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prev = prevStats.current;
    const stats = { narrative_integrity: nation.narrative_integrity, violence_authority: nation.violence_authority, supply_level: nation.supply_level, sanity: nation.sanity };
    let hadChange = false;
    let net = 0;

    for (const key of Object.keys(stats) as (keyof typeof stats)[]) {
      const diff = stats[key] - prev[key];
      if (diff !== 0) {
        hadChange = true;
        // For narrative_integrity, going up is bad (closer to madness)
        net += key === 'narrative_integrity' ? -diff : diff;
      }
      // Danger pulse: trigger once when entering <20 zone
      if (key !== 'narrative_integrity' && stats[key] < 20 && prev[key] >= 20 && !dangerTriggered.current.has(key)) {
        dangerTriggered.current.add(key);
        audioManager.playSfx('danger-pulse');
      }
      if (stats[key] >= 20) dangerTriggered.current.delete(key);
    }

    if (hadChange) {
      audioManager.playSfx(net >= 0 ? 'stat-up' : 'stat-down');
    }

    prevStats.current = stats;
  }, [nation.narrative_integrity, nation.violence_authority, nation.supply_level, nation.sanity]);

  const govLabel = GOVERNMENT_LABELS[nation.government_type] || nation.government_type;
  const govDesc = GOVERNMENT_DESCRIPTIONS[nation.government_type] || '';
  const activeBonuses = scapegoats.filter((sg) => !sg.sacrificed);

  return (
    <div className="panel p-3 h-full overflow-y-auto">
      <div className="text-accent text-center mb-3 border-b border-border pb-2 font-bold">
        {nation.name}
      </div>

      <div className="text-xs text-dim mb-1 text-center font-mono">
        第 {day} 天 | 人口: {nation.population}
      </div>
      <div className="text-xs text-center mb-3">
        <span className="pill-tag bg-gold/15 text-gold">{govLabel}</span>
        {govDesc && <div className="text-[10px] text-dim mt-1">{govDesc}</div>}
      </div>

      <ProgressBar label="叙事完整度" value={nation.narrative_integrity} color="blue" />
      <ProgressBar label="暴力权威" value={nation.violence_authority} color="red" />
      <ProgressBar label="给养储备" value={nation.supply_level} color="yellow" />
      <ProgressBar label="理智度" value={nation.sanity} color="green" />

      <div className="mt-3 pt-2 border-t border-border">
        <ProgressBar label="残暴值" value={nation.cruelty} color="magenta" />
        <ProgressBar label="腐败值" value={nation.corruption} color="cyan" />
      </div>

      {activeBonuses.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <div className="text-xs text-dim mb-1">每回合加成:</div>
          <div className="flex flex-wrap gap-1">
            {activeBonuses.map((sg) => (
              <span key={sg.id} className="pill-tag bg-teal/15 text-teal text-[10px]">
                {sg.bonus_description}
              </span>
            ))}
          </div>
        </div>
      )}

      {nation.traits.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <div className="text-xs text-dim mb-1">特质:</div>
          <div className="flex flex-wrap gap-1">
            {nation.traits.map((t) => (
              <span
                key={t}
                className="pill-tag bg-purple/15 text-purple"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {nation.mythology.length > 0 && (
        <div className="mt-3 pt-2 border-t border-border">
          <div className="text-xs text-dim mb-1">装备神话:</div>
          {nation.mythology.map((m) => (
            <div
              key={m.id}
              className="text-xs text-gold mb-1 bg-gold/10 border border-gold/20 rounded-[var(--radius-sm)] p-1.5"
            >
              {m.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
