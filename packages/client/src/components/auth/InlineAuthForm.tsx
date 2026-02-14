import { useAuthForm } from '../../hooks/useAuthForm';
import { AuthFormBody } from './AuthFormBody';

interface InlineAuthFormProps {
  onSuccess: () => void;
}

export function InlineAuthForm({ onSuccess }: InlineAuthFormProps) {
  const form = useAuthForm(onSuccess);

  const showHeader = form.view === 'login' || form.view === 'register';

  return (
    <div className="w-full max-w-sm mx-auto">
      {showHeader && (
        <>
          <div className="text-fg/80 text-sm mb-1 font-semibold">登录以开始游戏</div>
          <div className="text-dim text-xs mb-4">登录后可使用云存档，跨设备继续你的国族发明</div>
        </>
      )}
      <AuthFormBody {...form} />
    </div>
  );
}
