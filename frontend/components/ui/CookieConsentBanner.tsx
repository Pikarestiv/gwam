"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gwam-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("gwam-cookie-consent", "accepted");
    setVisible(false);
    // Load Umami after consent
    if (typeof window !== "undefined" && (window as any).__umami) {
      (window as any).__umami.track("consent_accepted");
    }
  };

  const decline = () => {
    localStorage.setItem("gwam-cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div
        className="rounded-2xl p-4 shadow-lg"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            🍪 We use analytics to improve Gwam. No personal data sold.
          </p>
          <button
            onClick={decline}
            style={{ color: "var(--color-muted)", flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "var(--color-primary)" }}
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-muted)",
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
