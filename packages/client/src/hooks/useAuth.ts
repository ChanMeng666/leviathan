import { useEffect, useCallback } from 'react';
import { authClient } from '../auth';
import { useGameStore } from '../stores';

export function useAuth() {
  const user = useGameStore((s) => s.user);
  const isAuthLoading = useGameStore((s) => s.isAuthLoading);
  const isGuest = useGameStore((s) => s.isGuest);
  const setUser = useGameStore((s) => s.setUser);
  const setIsAuthLoading = useGameStore((s) => s.setIsAuthLoading);
  const setIsGuest = useGameStore((s) => s.setIsGuest);
  const clearAuth = useGameStore((s) => s.clearAuth);

  // Check session on mount
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const { data } = await authClient.getSession();
        if (cancelled) return;
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name ?? null,
          });
        }
      } catch {
        // No session — stay as guest/unauthenticated
      } finally {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, [setUser, setIsAuthLoading]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message ?? '登录失败');
    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? null,
      });
      setIsGuest(false);
    }
  }, [setUser, setIsGuest]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await authClient.signUp.email({ email, password, name });
    if (error) throw new Error(error.message ?? '注册失败');
    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? null,
      });
      setIsGuest(false);
    }
  }, [setUser, setIsGuest]);

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

  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
    setIsAuthLoading(false);
  }, [setIsGuest, setIsAuthLoading]);

  return {
    user,
    isGuest,
    isAuthLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    enterGuestMode,
  };
}
