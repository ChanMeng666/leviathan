import { useCallback } from 'react';
import { authClient } from '../auth';
import { useGameStore } from '../stores';

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

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message ?? '登录失败');
    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? null,
      });
    }
  }, [setUser]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await authClient.signUp.email({ email, password, name });
    if (error) throw new Error(error.message ?? '注册失败');
    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? null,
      });
    }
  }, [setUser]);

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

  return {
    user,
    isAuthLoading,
    checkSession,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
