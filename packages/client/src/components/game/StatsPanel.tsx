import { useGameStore } from '../../stores';
import { ProgressBar } from '../ui/ProgressBar';

export function StatsPanel() {
  const nation = useGameStore((s) => s.nation);
  const day = useGameStore((s) => s.day);

  return (
    <div className="border border-terminal-dim p-3 h-full overflow-y-auto">
      <div className="text-terminal-green glow-green text-center mb-3 border-b border-terminal-dim pb-2">
        {'>'} {nation.name}
      </div>

      <div className="text-xs text-terminal-dim mb-3 text-center">
        DAY {day} | POP: {nation.population} | {nation.government_type.toUpperCase()}
      </div>

      <ProgressBar label="叙事完整度" value={nation.narrative_integrity} color="blue" />
      <ProgressBar label="暴力权威" value={nation.violence_authority} color="red" />
      <ProgressBar label="给养储备" value={nation.supply_level} color="yellow" />
      <ProgressBar label="理智度" value={nation.sanity} color="green" />

      <div className="mt-3 pt-2 border-t border-terminal-dim">
        <ProgressBar label="残暴值" value={nation.cruelty} color="magenta" />
        <ProgressBar label="腐败值" value={nation.corruption} color="cyan" />
      </div>

      {nation.traits.length > 0 && (
        <div className="mt-3 pt-2 border-t border-terminal-dim">
          <div className="text-xs text-terminal-dim mb-1">特质:</div>
          <div className="flex flex-wrap gap-1">
            {nation.traits.map((t) => (
              <span
                key={t}
                className="text-xs border border-terminal-magenta text-terminal-magenta px-1"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {nation.mythology.length > 0 && (
        <div className="mt-3 pt-2 border-t border-terminal-dim">
          <div className="text-xs text-terminal-dim mb-1">装备神话:</div>
          {nation.mythology.map((m) => (
            <div
              key={m.id}
              className="text-xs text-terminal-yellow mb-1 border border-terminal-dim p-1"
            >
              {m.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
