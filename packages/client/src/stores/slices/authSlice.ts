import type { StateCreator } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
}

export interface AuthSlice {
  user: AuthUser | null;
  isAuthLoading: boolean;
  authToken: string | null;

  setUser: (user: AuthUser | null) => void;
  setAuthToken: (token: string | null) => void;
  setIsAuthLoading: (v: boolean) => void;
  clearAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  isAuthLoading: true,
  authToken: null,

  setUser: (user) => set({ user }),
  setAuthToken: (token) => set({ authToken: token }),
  setIsAuthLoading: (v) => set({ isAuthLoading: v }),
  clearAuth: () => set({ user: null, authToken: null }),
});
