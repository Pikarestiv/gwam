"use client";

import { useState, useEffect } from "react";
import { usePwaStore } from "@/lib/stores/senderSessionStore";
import { GhostSVG } from "./GhostSVG";
import { X } from "lucide-react";

export function PWAInstallBanner() {
  const {
    deferredPrompt,
    visitCount,
    lastDismissedAt,
    setDeferredPrompt,
    dismiss,
  } = usePwaStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [setDeferredPrompt]);

  useEffect(() => {
    // Show after 2nd visit, not within 7 days of last dismiss
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const recentlyDismissed =
      lastDismissedAt && Date.now() - lastDismissedAt < sevenDays;

    if (visitCount >= 2 && deferredPrompt && !recentlyDismissed) {
      setVisible(true);
    }
  }, [visitCount, deferredPrompt, lastDismissedAt]);

  const install = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === "accepted") {
      // Track in Umami
      if (typeof window !== "undefined" && (window as any).umami) {
        (window as any).umami.track("pwa_installed");
      }
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div
        className="rounded-2xl p-4 shadow-glow"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-primary)",
        }}
      >
        <div className="flex items-start gap-3">
          <div style={{ color: "var(--color-primary)" }}>
            <GhostSVG size={36} />
          </div>
          <div className="flex-1">
            <p
              className="font-semibold text-sm mb-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Add Gwam to your home screen
            </p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Get the full app experience — faster, offline-ready.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            style={{ color: "var(--color-muted)" }}
          >
            <X size={16} />
          </button>
        </div>
        <button onClick={install} className="btn-primary mt-3 text-sm py-2">
          Install App 👻
        </button>
      </div>
    </div>
  );
}
