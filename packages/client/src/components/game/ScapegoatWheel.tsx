import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { useGameStore } from '../../stores';
import type { ScapegoatGroup } from '@leviathan/shared';
import { useSfx } from '../../hooks/useAudio';

interface ScapegoatWheelProps {
  open: boolean;
  onClose: () => void;
  groups: ScapegoatGroup[];
}

/**
 * ScapegoatWheel — legacy component, currently unused in the crisis-based game loop.
 * Kept for potential future reuse.
 */
export function ScapegoatWheel({ open, onClose, groups }: ScapegoatWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<ScapegoatGroup | null>(null);
  const nation = useGameStore((s) => s.nation);
  const applyStatChanges = useGameStore((s) => s.applyStatChanges);
  const addTrait = useGameStore((s) => s.addTrait);
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry);
  const incrementAffinity = useGameStore((s) => s.incrementAffinity);
  const { play: sfx } = useSfx();

  const availableGroups = groups.filter((sg) => !sg.sacrificed);

  const handleSacrifice = (group: ScapegoatGroup) => {
    sfx('wheel-spin');
    setSpinning(true);
    setSelected(group);

    setTimeout(() => {
      sfx('sacrifice');
      applyStatChanges({
        power: 10,
        tyranny: 15,
        population: -100,
      });
      addTrait(`清洗了${group.name}`);
      addHistoryEntry(`替罪羊轮盘: 清洗了${group.name}。`);
      incrementAffinity('theocracy', 10);
      incrementAffinity('warlord', 8);
      setSpinning(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal open={open} onClose={spinning ? undefined : onClose} title="替罪羊轮盘" variant="danger">
      <div className="text-center mb-4">
        <div className="text-red text-lg font-bold">权力: {nation.power}%</div>
        <div className="text-xs text-dim mt-1">
          选择一个群体作为替罪羊。他们将永远消失，但民众的怒火会暂时平息。
        </div>
      </div>

      {spinning ? (
        <motion.div
          className="text-center py-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="text-red text-2xl font-bold">
            清洗中...
          </div>
          {selected && (
            <div className="text-gold mt-2">{selected.name} 正在被"重新安置"</div>
          )}
        </motion.div>
      ) : availableGroups.length === 0 ? (
        <div className="text-center py-8 text-dim text-sm">
          所有群体都已被清洗。没有替罪羊了。
          <br />
          <span className="text-xs text-red/60">当你消灭了所有"敌人"，下一个敌人就是你自己。</span>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <button
              key={group.id}
              className={`w-full card-face border-2 p-3 text-left transition-colors rounded-[var(--radius-card)] ${
                group.sacrificed
                  ? 'border-dim/20 opacity-40 cursor-not-allowed'
                  : 'border-red/20 hover:border-red'
              }`}
              onClick={() => !group.sacrificed && handleSacrifice(group)}
              disabled={group.sacrificed}
            >
              <div className={`text-sm font-bold ${group.sacrificed ? 'text-dim line-through' : 'text-red'}`}>
                {group.name}
                {group.sacrificed && ' (已清洗)'}
              </div>
              <div className="text-xs text-[#5A6A52]">{group.bonus_description}</div>
              <div className="text-[10px] text-orange mt-0.5">
                {group.sacrificed ? '已永久失去此加成' : '清洗后将永久失去此加成 | -100人口'}
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
