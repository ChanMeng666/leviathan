import { useState } from 'react';
import type { GameSaveMeta } from '@leviathan/shared';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface SaveListProps {
  saves: GameSaveMeta[];
  isLoading: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function SaveList({ saves, isLoading, onLoad, onDelete, compact }: SaveListProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-dim text-xs text-center py-4">加载中...</div>;
  }

  if (saves.length === 0) {
    return (
      <div className="text-dim text-xs text-center py-4">
        暂无云存档 — 游戏中可随时手动保存
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-2 ${compact ? '' : 'max-h-64 overflow-y-auto'}`}>
        {saves.map((save) => {
          const isAuto = save.slotName === '自动存档';
          return (
            <div
              key={save.id}
              className="panel p-3 flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm text-fg flex items-center gap-2">
                  <span className={`pill-tag text-[10px] ${isAuto ? 'bg-blue/20 text-blue' : 'bg-gold/20 text-gold'}`}>
                    {isAuto ? '自动' : '手动'}
                  </span>
                  <span className="truncate">
                    {save.nationName}
                    <span className="text-dim text-xs ml-1">
                      第 <span className="font-mono">{save.day}</span> 天
                    </span>
                  </span>
                </div>
                <div className="text-[10px] text-dim mt-0.5">
                  {formatTime(save.updatedAt)}
                </div>
              </div>
              <div className="flex gap-1 ml-2 shrink-0">
                <button
                  className="btn-secondary text-[10px] px-2 py-1"
                  onClick={() => onLoad(save.id)}
                >
                  加载
                </button>
                <button
                  className="text-red text-[10px] px-2 py-1 hover:bg-surface rounded transition-colors"
                  onClick={() => setDeleteTarget(save.id)}
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget);
        }}
        title="删除存档"
        message="确定要删除这个存档吗？此操作不可撤销。"
        confirmText="删除"
        variant="danger"
      />
    </>
  );
}
