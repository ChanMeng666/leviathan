import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  color: 'blue' | 'red' | 'yellow' | 'green' | 'cyan' | 'magenta';
  showValue?: boolean;
  hidden?: boolean;
}

const colorMap: Record<string, { bar: string; text: string; glow: string }> = {
  blue: { bar: 'bg-terminal-blue', text: 'text-terminal-blue', glow: 'glow-blue' },
  red: { bar: 'bg-terminal-red', text: 'text-terminal-red', glow: 'glow-red' },
  yellow: { bar: 'bg-terminal-yellow', text: 'text-terminal-yellow', glow: 'glow-yellow' },
  green: { bar: 'bg-terminal-green', text: 'text-terminal-green', glow: 'glow-green' },
  cyan: { bar: 'bg-terminal-cyan', text: 'text-terminal-cyan', glow: '' },
  magenta: { bar: 'bg-terminal-magenta', text: 'text-terminal-magenta', glow: '' },
};

export function ProgressBar({
  value,
  max = 100,
  label,
  color,
  showValue = true,
  hidden = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const c = colorMap[color];
  const isLow = pct < 20;

  if (hidden) return null;

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-0.5">
        <span className={`${c.text} ${isLow ? 'animate-pulse' : ''}`}>{label}</span>
        {showValue && (
          <span className="text-terminal-dim">
            {value}/{max}
          </span>
        )}
      </div>
      <div className="h-2 bg-terminal-bg border border-terminal-dim">
        <motion.div
          className={`h-full ${c.bar} ${isLow ? 'animate-pulse' : ''}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
