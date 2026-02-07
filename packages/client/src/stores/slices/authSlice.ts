import type { StateCreator } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthSlice {
  user: AuthUser | null;
  isAuthLoading: boolean;
  authToken: string | null;
  isGuest: boolean;

  setUser: (user: AuthUser | null) => void;
  setAuthToken: (token: string | null) => void;
  setIsAuthLoading: (v: boolean) => void;
  setIsGuest: (v: boolean) => void;
  clearAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  user: null,
  isAuthLoading: true,
  authToken: null,
  isGuest: false,

  setUser: (user) => set({ user }),
  setAuthToken: (token) => set({ authToken: token }),
  setIsAuthLoading: (v) => set({ isAuthLoading: v }),
  setIsGuest: (v) => set({ isGuest: v }),
  clearAuth: () => set({ user: null, authToken: null, isGuest: false }),
});
