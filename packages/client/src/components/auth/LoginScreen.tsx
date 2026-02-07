import { useState } from 'react';
import { motion } from 'framer-motion';
import { BalatroBackground } from '../ui/BalatroBackground';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'login' | 'register';

export function LoginScreen() {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, signInWithGoogle, enterGuestMode } = useAuth();

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
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      <BalatroBackground className="z-0" />

      <motion.div
        className="relative z-10 max-w-sm w-full mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="panel-raised p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-accent text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              利维坦的诞生
            </h1>
            <p className="text-dim text-xs mt-1">登录以使用云存档</p>
          </div>

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

          {/* Guest bypass */}
          <div className="text-center mt-4">
            <button
              className="text-dim text-xs hover:text-accent transition-colors underline underline-offset-2"
              onClick={enterGuestMode}
            >
              以游客身份继续
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
