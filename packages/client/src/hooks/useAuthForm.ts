import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

export type AuthView = 'login' | 'register' | 'verify-email' | 'forgot-password' | 'reset-password';

export interface AuthFormState {
  view: AuthView;
  email: string;
  password: string;
  name: string;
  otp: string;
  newPassword: string;
  error: string;
  success: string;
  isSubmitting: boolean;
  resendCooldown: number;
}

export interface AuthFormActions {
  setView: (view: AuthView) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setName: (v: string) => void;
  setOtp: (v: string) => void;
  setNewPassword: (v: string) => void;
  setError: (v: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
  handleVerifyEmail: (e: React.FormEvent) => void;
  handleResendOtp: () => void;
  handleForgotPassword: (e: React.FormEvent) => void;
  handleResetPassword: (e: React.FormEvent) => void;
  signInWithGoogle: () => void;
}

export function useAuthForm(onSuccess: () => void): AuthFormState & AuthFormActions {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    verifyEmailOtp,
    resendVerificationOtp,
    sendPasswordResetOtp,
    resetPassword,
  } = useAuth();

  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-detect unverified user from session restore
  const autoDetectedRef = useRef(false);
  useEffect(() => {
    if (user && !user.emailVerified && !autoDetectedRef.current) {
      autoDetectedRef.current = true;
      setEmail(user.email);
      setView('verify-email');
    }
  }, [user]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.needsVerification) {
        setView('verify-email');
        setResendCooldown(60);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, signIn, onSuccess]);

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('请输入名称');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(email, password, name);
      setView('verify-email');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, name, signUp]);

  const handleVerifyEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length < 6) {
      setError('请输入完整的6位验证码');
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyEmailOtp(email, otp);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, otp, verifyEmailOtp, onSuccess]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await resendVerificationOtp(email);
      setResendCooldown(60);
      setSuccess('验证码已重新发送');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    }
  }, [email, resendCooldown, resendVerificationOtp]);

  const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('请输入邮箱');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordResetOtp(email);
      setView('reset-password');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, sendPasswordResetOtp]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length < 6) {
      setError('请输入完整的6位验证码');
      return;
    }
    if (newPassword.length < 8) {
      setError('密码至少8个字符');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('密码已重置，请使用新密码登录');
      setOtp('');
      setNewPassword('');
      setPassword('');
      setTimeout(() => {
        setSuccess('');
        setView('login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, otp, newPassword, resetPassword]);

  return {
    view,
    email,
    password,
    name,
    otp,
    newPassword,
    error,
    success,
    isSubmitting,
    resendCooldown,
    setView,
    setEmail,
    setPassword,
    setName,
    setOtp,
    setNewPassword,
    setError,
    handleLogin,
    handleRegister,
    handleVerifyEmail,
    handleResendOtp,
    handleForgotPassword,
    handleResetPassword,
    signInWithGoogle,
  };
}
