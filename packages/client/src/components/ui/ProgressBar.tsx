import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  color: 'blue' | 'red' | 'yellow' | 'green' | 'cyan' | 'magenta';
  showValue?: boolean;
  hidden?: boolean;
}

const colorMap: Record<string, { bar: string; text: string }> = {
  blue: { bar: 'bg-blue', text: 'text-blue' },
  red: { bar: 'bg-red', text: 'text-red' },
  yellow: { bar: 'bg-gold', text: 'text-gold' },
  green: { bar: 'bg-teal', text: 'text-teal' },
  cyan: { bar: 'bg-teal', text: 'text-teal' },
  magenta: { bar: 'bg-purple', text: 'text-purple' },
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
        <span className={c.text}>{label}</span>
        {showValue && (
          <span className="text-dim font-mono text-[11px]">
            {value}/{max}
          </span>
        )}
      </div>
      <div className={`h-2 bg-surface rounded-full overflow-hidden ${isLow ? 'pulse-danger' : ''}`}>
        <motion.div
          className={`h-full ${c.bar} rounded-full`}
          style={{
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
          }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
