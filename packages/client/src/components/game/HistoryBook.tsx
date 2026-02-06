import { useGameStore } from '../../stores';
import { Modal } from '../ui/Modal';

interface HistoryBookProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryBook({ open, onClose }: HistoryBookProps) {
  const nation = useGameStore((s) => s.nation);

  return (
    <Modal open={open} onClose={onClose} title="历史档案" variant="default">
      <div className="max-h-80 overflow-y-auto space-y-2">
        {nation.history_log.length === 0 ? (
          <div className="text-terminal-dim text-xs text-center py-4">
            [档案空白——历史尚未开始]
          </div>
        ) : (
          nation.history_log.map((entry, i) => (
            <div key={i} className="text-xs text-terminal-fg border-l border-terminal-dim pl-2">
              {entry}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
