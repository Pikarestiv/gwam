import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme =
  | "gwam_dark"
  | "neon_magenta"
  | "soft_dark"
  | "lemon_black"
  | "orange_black"
  | "light_ghost";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "gwam_dark",
      setTheme: (theme) => {
        set({ theme });
        // Apply to document root
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },
    }),
    { name: "gwam-theme" },
  ),
);
