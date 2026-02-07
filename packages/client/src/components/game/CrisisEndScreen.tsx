import { motion } from 'framer-motion';
import { useGameStore } from '../../stores';
import { BalatroBackground } from '../ui/BalatroBackground';

const hexToGL = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

interface Props { onContinue: () => void; }

export function CrisisEndScreen({ onContinue }: Props) {
  const crisisState = useGameStore((s) => s.crisisState);
  const success = crisisState.roundScore >= crisisState.targetScore;
  const overDouble = crisisState.roundScore >= crisisState.targetScore * 2;

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      <BalatroBackground
        color1={success ? hexToGL('#2A6B3E') : hexToGL('#DE443B')}
        color2={success ? hexToGL('#1B2B1B') : hexToGL('#3B1C1C')}
        color3={hexToGL('#0A0A0A')}
        className="z-0"
      />
      <div className="relative z-10 max-w-lg w-full text-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={`text-4xl font-bold mb-2 ${success ? 'text-gold' : 'text-red'}`} style={{ fontFamily: 'var(--font-display)' }}>
            {success ? '危机通过' : '危机失败'}
          </div>
        </motion.div>

        <motion.div className="panel p-6 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="text-dim text-xs mb-1">宣传力</div>
          <div className="text-gold text-3xl font-bold font-mono mb-1">
            {crisisState.roundScore.toLocaleString()}
          </div>
          <div className="text-dim text-xs mb-3">
            目标: {crisisState.targetScore.toLocaleString()}
          </div>

          {!success && (
            <div className="text-red text-sm mb-2">失去 1 条命</div>
          )}
          {overDouble && (
            <div className="text-gold text-sm mb-2">超额 2 倍！额外获得 +2 影响力</div>
          )}

          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className={`text-xl ${i < crisisState.lives ? 'text-red' : 'text-dim/30'}`}>♥</span>
            ))}
          </div>
        </motion.div>

        <motion.button
          className="btn-primary px-8 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onContinue}
        >
          继续
        </motion.button>
      </div>
    </div>
  );
}
