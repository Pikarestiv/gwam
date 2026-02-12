import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SenderSessionState {
  sendCount: number;
  promptShown: boolean;
  senderToken: string | null;
  lastDismissedAt: number | null;
  incrementSendCount: () => void;
  setPromptShown: () => void;
  setSenderToken: (token: string) => void;
  resetSession: () => void;
}

export const useSenderSessionStore = create<SenderSessionState>()(
  persist(
    (set) => ({
      sendCount: 0,
      promptShown: false,
      senderToken: null,
      lastDismissedAt: null,
      incrementSendCount: () => set((s) => ({ sendCount: s.sendCount + 1 })),
      setPromptShown: () => set({ promptShown: true }),
      setSenderToken: (token) => set({ senderToken: token }),
      resetSession: () =>
        set({ sendCount: 0, promptShown: false, senderToken: null }),
    }),
    { name: "gwam-sender-session" },
  ),
);

// PWA install prompt store (not persisted — session only)
interface PwaState {
  deferredPrompt: Event | null;
  visitCount: number;
  lastDismissedAt: number | null;
  setDeferredPrompt: (e: Event | null) => void;
  incrementVisitCount: () => void;
  dismiss: () => void;
}

export const usePwaStore = create<PwaState>()(
  persist(
    (set) => ({
      deferredPrompt: null,
      visitCount: 0,
      lastDismissedAt: null,
      setDeferredPrompt: (e) => set({ deferredPrompt: e }),
      incrementVisitCount: () => set((s) => ({ visitCount: s.visitCount + 1 })),
      dismiss: () => set({ lastDismissedAt: Date.now(), deferredPrompt: null }),
    }),
    {
      name: "gwam-pwa",
      partialize: (s) => ({
        visitCount: s.visitCount,
        lastDismissedAt: s.lastDismissedAt,
      }),
    },
  ),
);
