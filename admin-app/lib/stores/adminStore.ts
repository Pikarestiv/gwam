import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  admin: any | null;
  token: string | null;
  isAuthenticated: boolean;
  setAdmin: (admin: any) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      setAdmin: (admin) => set({ admin, isAuthenticated: !!admin }),
      setToken: (token) => set({ token }),
      logout: () => set({ admin: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "gwam-admin-storage",
      onRehydrateStorage: () => (state) => {
        if (state && state.admin && state.token) {
          state.isAuthenticated = true;
        }
      },
    },
  ),
);
