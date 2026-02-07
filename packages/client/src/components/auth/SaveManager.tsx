import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { useGameStore } from '../../stores';
import { useCloudSaves } from '../../hooks/useCloudSaves';

interface SaveManagerProps {
  open: boolean;
  onClose: () => void;
}

export function SaveManager({ open, onClose }: SaveManagerProps) {
  const user = useGameStore((s) => s.user);
  const { saves, isLoading, fetchSaves, saveGame, loadSave, deleteSave } = useCloudSaves();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && user) {
      fetchSaves();
    }
  }, [open, user, fetchSaves]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await saveGame('手动存档');
      await fetchSaves();
    } catch {
      setError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    setError('');
    try {
      await loadSave(id);
      onClose();
    } catch {
      setError('加载失败');
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteSave(id);
    } catch {
      setError('删除失败');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="存档管理">
      {!user ? (
        <div className="text-center py-8">
          <p className="text-dim text-sm">登录以使用云存档</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Save current game button */}
          <button
            className="btn-primary w-full text-sm py-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存当前游戏'}
          </button>

          {error && <div className="text-red text-xs">{error}</div>}

          {/* Save list */}
          {isLoading ? (
            <div className="text-dim text-xs text-center py-4">加载中...</div>
          ) : saves.length === 0 ? (
            <div className="text-dim text-xs text-center py-4">暂无云存档</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {saves.map((save) => (
                <div
                  key={save.id}
                  className="panel p-3 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-fg truncate">
                      {save.slotName}
                      <span className="text-dim text-xs ml-2">
                        {save.nationName} - 第 <span className="font-mono">{save.day}</span> 天
                      </span>
                    </div>
                    <div className="text-[10px] text-dim">
                      {new Date(save.updatedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button
                      className="btn-secondary text-[10px] px-2 py-1"
                      onClick={() => handleLoad(save.id)}
                    >
                      加载
                    </button>
                    <button
                      className="text-red text-[10px] px-2 py-1 hover:bg-surface rounded transition-colors"
                      onClick={() => handleDelete(save.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
