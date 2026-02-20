import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_seed: string;
  bio: string | null;
  email_verified_at?: string | null;
  inbox_active: boolean;
  is_verified?: boolean;
  theme_preference: "gwam_dark" | "neon_magenta" | "soft_dark";
  message_retention_months: number;
  is_suspended?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isVerified: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isVerified: !!(
            user.is_verified ||
            user.inbox_active ||
            user.email_verified_at
          ),
        }),
      setUser: (user) =>
        set({
          user,
          isVerified: !!(
            user.is_verified ||
            user.inbox_active ||
            user.email_verified_at
          ),
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isVerified: false,
        }),
    }),
    {
      name: "gwam-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state && state.user && state.token) {
          state.isAuthenticated = true;
          state.isVerified = !!(
            state.user.is_verified ||
            state.user.inbox_active ||
            state.user.email_verified_at
          );
        }
      },
    },
  ),
);
