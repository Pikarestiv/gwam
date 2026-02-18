"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePwaStore } from "@/lib/stores/senderSessionStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { incrementVisitCount } = usePwaStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme on mount
    document.documentElement.setAttribute("data-theme", theme);
    // Track visit count for PWA install prompt
    incrementVisitCount();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Prevent flash of wrong theme
  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
