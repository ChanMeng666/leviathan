import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { useGameStore } from '../../stores';
import type { ScapegoatGroup } from '@leviathan/shared';

const SCAPEGOAT_GROUPS: ScapegoatGroup[] = [
  {
    id: 'sg_intellectuals',
    name: '知识分子',
    bonus_description: '+5 叙事完整度/回合',
    stat_bonus: { narrative_integrity: 5 },
    sacrificed: false,
  },
  {
    id: 'sg_merchants',
    name: '商人阶层',
    bonus_description: '+5 给养/回合',
    stat_bonus: { supply_level: 5 },
    sacrificed: false,
  },
  {
    id: 'sg_soldiers',
    name: '老兵集团',
    bonus_description: '+5 暴力权威/回合',
    stat_bonus: { violence_authority: 5 },
    sacrificed: false,
  },
  {
    id: 'sg_priests',
    name: '宗教人士',
    bonus_description: '+5 理智/回合',
    stat_bonus: { sanity: 5 },
    sacrificed: false,
  },
];

interface ScapegoatWheelProps {
  open: boolean;
  onClose: () => void;
}

export function ScapegoatWheel({ open, onClose }: ScapegoatWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<ScapegoatGroup | null>(null);
  const nation = useGameStore((s) => s.nation);
  const applyStatChanges = useGameStore((s) => s.applyStatChanges);
  const addTrait = useGameStore((s) => s.addTrait);
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry);

  const unsat = Math.max(0, 100 - nation.narrative_integrity - nation.violence_authority);

  const handleSacrifice = (group: ScapegoatGroup) => {
    setSpinning(true);
    setSelected(group);

    setTimeout(() => {
      // Clear dissatisfaction by boosting narrative
      applyStatChanges({ narrative_integrity: 20, violence_authority: 10, cruelty: 15 });
      addTrait(`清洗了${group.name}`);
      addHistoryEntry(`[Day] 替罪羊轮盘: 清洗了${group.name}，不满归零。`);
      setSpinning(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal open={open} onClose={spinning ? undefined : onClose} title="替罪羊轮盘" variant="danger">
      <div className="text-center mb-4">
        <div className="text-terminal-red text-lg glow-red">不满值: {unsat}%</div>
        <div className="text-xs text-terminal-dim mt-1">
          选择一个群体作为替罪羊。他们将永远消失，但民众的怒火会暂时平息。
        </div>
      </div>

      {spinning ? (
        <motion.div
          className="text-center py-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="text-terminal-red text-2xl glow-red">
            {'>>>'} 清洗中... {'<<<'}
          </div>
          {selected && (
            <div className="text-terminal-yellow mt-2">{selected.name} 正在被"重新安置"</div>
          )}
        </motion.div>
      ) : (
        <div className="space-y-2">
          {SCAPEGOAT_GROUPS.map((group) => (
            <button
              key={group.id}
              className="w-full border border-terminal-red/30 hover:border-terminal-red p-3 text-left transition-colors"
              onClick={() => handleSacrifice(group)}
            >
              <div className="text-sm text-terminal-red">{group.name}</div>
              <div className="text-xs text-terminal-dim">{group.bonus_description}</div>
              <div className="text-[10px] text-terminal-yellow mt-0.5">
                清洗后将永久失去此加成
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
