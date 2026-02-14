import { useCallback } from 'react';
import { authClient, emailOtp } from '../auth';
import { useGameStore } from '../stores';

// Better Auth returns this error when email is not verified
const EMAIL_NOT_VERIFIED_RE = /email.*(not|isn.t)\s*verified/i;

export function useAuth() {
  const user = useGameStore((s) => s.user);
  const isAuthLoading = useGameStore((s) => s.isAuthLoading);
  const setUser = useGameStore((s) => s.setUser);
  const setIsAuthLoading = useGameStore((s) => s.setIsAuthLoading);
  const clearAuth = useGameStore((s) => s.clearAuth);

  const checkSession = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name ?? null,
          emailVerified: !!data.user.emailVerified,
        });
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setIsAuthLoading(false);
    }
  }, [setUser, setIsAuthLoading, clearAuth]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ needsVerification?: boolean; email?: string }> => {
    const { data, error } = await authClient.signIn.email({ email, password });

    // Better Auth rejects sign-in entirely for unverified emails —
    // intercept the error, send a verification OTP, and let the UI
    // transition to the verify-email view instead of showing a dead-end.
    if (error) {
      const msg = error.message ?? '';
      if (EMAIL_NOT_VERIFIED_RE.test(msg)) {
        await emailOtp.sendVerificationOtp(email, 'email-verification');
        return { needsVerification: true, email };
      }
      throw new Error(msg || '登录失败');
    }

    if (data?.user && !data.user.emailVerified) {
      await emailOtp.sendVerificationOtp(email, 'email-verification');
      return { needsVerification: true, email };
    }

    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? null,
        emailVerified: true,
      });
    }
    return {};
  }, [setUser]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ needsVerification: true; email: string }> => {
    const { error } = await authClient.signUp.email({ email, password, name });
    if (error) throw new Error(error.message ?? '注册失败');
    return { needsVerification: true, email };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin,
    });
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    clearAuth();
  }, [clearAuth]);

  const verifyEmailOtp = useCallback(async (email: string, otp: string, savedPassword?: string) => {
    const { error } = await emailOtp.verifyEmail(email, otp);
    if (error) throw new Error(error.message ?? '验证码错误');
    // Try to pick up session from verifyEmail response
    await checkSession();
    // If no session was established (sign-in was previously rejected),
    // re-attempt sign-in now that the email is verified
    const currentUser = useGameStore.getState().user;
    if (!currentUser && savedPassword) {
      const { data } = await authClient.signIn.email({ email, password: savedPassword });
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name ?? null,
          emailVerified: true,
        });
      }
    }
  }, [checkSession, setUser]);

  const resendVerificationOtp = useCallback(async (email: string) => {
    const { error } = await emailOtp.sendVerificationOtp(email, 'email-verification');
    if (error) throw new Error(error.message ?? '发送验证码失败');
  }, []);

  const sendPasswordResetOtp = useCallback(async (email: string) => {
    const { error } = await emailOtp.forgetPassword(email);
    if (error) throw new Error(error.message ?? '发送重置码失败');
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, password: string) => {
    const { error } = await emailOtp.resetPassword(email, otp, password);
    if (error) throw new Error(error.message ?? '重置密码失败');
  }, []);

  return {
    user,
    isAuthLoading,
    checkSession,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    verifyEmailOtp,
    resendVerificationOtp,
    sendPasswordResetOtp,
    resetPassword,
  };
}
