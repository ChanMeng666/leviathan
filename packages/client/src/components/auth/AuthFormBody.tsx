import { OtpInput } from '../ui/OtpInput';
import type { AuthFormState, AuthFormActions } from '../../hooks/useAuthForm';

type Props = AuthFormState & AuthFormActions;

const inputClass = 'w-full px-3 py-2 bg-surface border border-border rounded-[var(--radius-sm)] text-fg text-sm placeholder:text-dim focus:outline-none focus:border-accent';

export function AuthFormBody(props: Props) {
  const {
    view,
    email, setEmail,
    password, setPassword,
    name, setName,
    otp, setOtp,
    newPassword, setNewPassword,
    error, success,
    isSubmitting,
    resendCooldown,
    setView, setError,
    handleLogin, handleRegister,
    handleVerifyEmail, handleResendOtp,
    handleForgotPassword, handleResetPassword,
    signInWithGoogle,
  } = props;

  if (view === 'verify-email') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-fg text-sm font-semibold mb-1">验证你的邮箱</div>
          <div className="text-dim text-xs">
            验证码已发送至 <span className="text-fg/80">{email}</span>
          </div>
        </div>

        <form onSubmit={handleVerifyEmail} className="space-y-3">
          <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />

          {error && <div className="text-red text-xs py-1 text-center">{error}</div>}
          {success && <div className="text-green text-xs py-1 text-center">{success}</div>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm py-2.5">
            {isSubmitting ? '验证中...' : '验证'}
          </button>
        </form>

        <div className="text-center text-xs text-dim">
          {resendCooldown > 0 ? (
            <span>{resendCooldown}秒后可重新发送</span>
          ) : (
            <button onClick={handleResendOtp} className="text-accent hover:underline">
              重新发送验证码
            </button>
          )}
        </div>

        <button
          onClick={() => { setView('login'); setError(''); setOtp(''); }}
          className="text-dim text-xs hover:text-fg transition-colors w-full text-center"
        >
          返回登录
        </button>
      </div>
    );
  }

  if (view === 'forgot-password') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-fg text-sm font-semibold mb-1">忘记密码</div>
          <div className="text-dim text-xs">输入你的邮箱，我们将发送验证码</div>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-3">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />

          {error && <div className="text-red text-xs py-1">{error}</div>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm py-2.5">
            {isSubmitting ? '发送中...' : '发送验证码'}
          </button>
        </form>

        <button
          onClick={() => { setView('login'); setError(''); }}
          className="text-dim text-xs hover:text-fg transition-colors w-full text-center"
        >
          返回登录
        </button>
      </div>
    );
  }

  if (view === 'reset-password') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-fg text-sm font-semibold mb-1">重置密码</div>
          <div className="text-dim text-xs">
            验证码已发送至 <span className="text-fg/80">{email}</span>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-3">
          <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />

          <input
            type="password"
            placeholder="新密码（至少8个字符）"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
          />

          {error && <div className="text-red text-xs py-1">{error}</div>}
          {success && <div className="text-green text-xs py-1 text-center">{success}</div>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm py-2.5">
            {isSubmitting ? '重置中...' : '重置密码'}
          </button>
        </form>

        <button
          onClick={() => { setView('login'); setError(''); setOtp(''); setNewPassword(''); }}
          className="text-dim text-xs hover:text-fg transition-colors w-full text-center"
        >
          返回登录
        </button>
      </div>
    );
  }

  // login | register views
  const isLogin = view === 'login';

  return (
    <div>
      {/* Tab bar */}
      <div className="flex mb-4 border-b border-border">
        <button
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            isLogin ? 'text-accent border-b-2 border-accent' : 'text-dim hover:text-fg'
          }`}
          onClick={() => { setView('login'); setError(''); }}
        >
          登录
        </button>
        <button
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            !isLogin ? 'text-accent border-b-2 border-accent' : 'text-dim hover:text-fg'
          }`}
          onClick={() => { setView('register'); setError(''); }}
        >
          注册
        </button>
      </div>

      {/* Form */}
      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3">
        {!isLogin && (
          <input
            type="text"
            placeholder="名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        )}
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className={inputClass}
        />

        {isLogin && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => { setView('forgot-password'); setError(''); }}
              className="text-dim text-xs hover:text-accent transition-colors"
            >
              忘记密码?
            </button>
          </div>
        )}

        {error && <div className="text-red text-xs py-1">{error}</div>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm py-2.5">
          {isSubmitting ? '处理中...' : isLogin ? '登录' : '注册'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 border-t border-border" />
        <span className="text-dim text-xs">或</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Google OAuth */}
      <button className="btn-secondary w-full text-sm py-2.5" onClick={signInWithGoogle}>
        使用 Google 登录
      </button>
    </div>
  );
}
