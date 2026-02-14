import { Modal } from '../ui/Modal';
import { useAuthForm } from '../../hooks/useAuthForm';
import { AuthFormBody } from './AuthFormBody';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const VIEW_TITLES: Record<string, string> = {
  login: '登录',
  register: '注册',
  'verify-email': '验证邮箱',
  'forgot-password': '忘记密码',
  'reset-password': '重置密码',
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const form = useAuthForm(onClose);

  return (
    <Modal open={open} onClose={onClose} title={VIEW_TITLES[form.view]}>
      <AuthFormBody {...form} />
    </Modal>
  );
}
