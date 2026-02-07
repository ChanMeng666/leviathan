import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface InlineAuthFormProps {
  onSuccess: () => void;
}

type Tab = 'login' | 'register';

export function InlineAuthForm({ onSuccess }: InlineAuthFormProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError('请输入名称');
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, name);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-fg/80 text-sm mb-1 font-semibold">登录以开始游戏</div>
      <div className="text-dim text-xs mb-4">登录后可使用云存档，跨设备继续你的国族发明</div>

      {/* Tab bar */}
      <div className="flex mb-4 border-b border-border">
        <button
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            tab === 'login'
              ? 'text-accent border-b-2 border-accent'
              : 'text-dim hover:text-fg'
          }`}
          onClick={() => { setTab('login'); setError(''); }}
        >
          登录
        </button>
        <button
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            tab === 'register'
              ? 'text-accent border-b-2 border-accent'
              : 'text-dim hover:text-fg'
          }`}
          onClick={() => { setTab('register'); setError(''); }}
        >
          注册
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {tab === 'register' && (
          <input
            type="text"
            placeholder="名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-[var(--radius-sm)] text-fg text-sm placeholder:text-dim focus:outline-none focus:border-accent"
          />
        )}
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 bg-surface border border-border rounded-[var(--radius-sm)] text-fg text-sm placeholder:text-dim focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 bg-surface border border-border rounded-[var(--radius-sm)] text-fg text-sm placeholder:text-dim focus:outline-none focus:border-accent"
        />

        {error && (
          <div className="text-red text-xs py-1">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full text-sm py-2.5"
        >
          {isSubmitting ? '处理中...' : tab === 'login' ? '登录' : '注册'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-border" />
        <span className="text-dim text-xs">或</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Google OAuth */}
      <button
        className="btn-secondary w-full text-sm py-2.5"
        onClick={signInWithGoogle}
      >
        使用 Google 登录
      </button>
    </div>
  );
}
