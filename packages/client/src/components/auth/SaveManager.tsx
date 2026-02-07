import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { SaveList } from './SaveList';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useGameStore } from '../../stores';
import { useCloudSaves } from '../../hooks/useCloudSaves';

interface SaveManagerProps {
  open: boolean;
  onClose: () => void;
}

export function SaveManager({ open, onClose }: SaveManagerProps) {
  const user = useGameStore((s) => s.user);
  const day = useGameStore((s) => s.day);
  const { saves, isLoading, fetchSaves, saveGame, loadSave, deleteSave } = useCloudSaves();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadConfirmId, setLoadConfirmId] = useState<string | null>(null);

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
    // If there's an active game, confirm before overwriting
    if (day > 0) {
      setLoadConfirmId(id);
      return;
    }
    await doLoad(id);
  };

  const doLoad = async (id: string) => {
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
    <>
      <Modal open={open} onClose={onClose} title="存档管理">
        {!user ? (
          <div className="text-center py-8">
            <p className="text-dim text-sm">登录以使用云存档</p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              className="btn-primary w-full text-sm py-2"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存当前游戏'}
            </button>

            {error && <div className="text-red text-xs">{error}</div>}

            <SaveList
              saves={saves}
              isLoading={isLoading}
              onLoad={handleLoad}
              onDelete={handleDelete}
            />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={loadConfirmId !== null}
        onClose={() => setLoadConfirmId(null)}
        onConfirm={() => {
          if (loadConfirmId) doLoad(loadConfirmId);
        }}
        title="加载存档"
        message="加载此存档将覆盖当前游戏进度，确定继续吗？"
        confirmText="加载"
      />
    </>
  );
}
