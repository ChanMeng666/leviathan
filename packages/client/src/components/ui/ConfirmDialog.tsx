import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} variant={variant}>
      <p className="text-sm text-fg/80 mb-5">{message}</p>
      <div className="flex gap-2 justify-end">
        <button className="btn-secondary text-sm px-4 py-2" onClick={onClose}>
          {cancelText}
        </button>
        <button
          className={`${variant === 'danger' ? 'btn-danger' : 'btn-primary'} text-sm px-4 py-2`}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
