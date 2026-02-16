"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSenderSessionStore } from "@/lib/stores/senderSessionStore";

interface InterstitialAdProps {
  onClose: () => void;
}

export function InterstitialAd({ onClose }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(5);
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSkip = () => {
    // Track skip in Umami
    if (typeof window !== "undefined" && (window as any).umami) {
      (window as any).umami.track("ad_interstitial_skipped");
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fade-in"
      style={{ background: "rgba(0,0,0,0.95)" }}
    >
      <p className="text-xs mb-4" style={{ color: "var(--color-muted)" }}>
        Ads keep Gwam free 👻
      </p>

      {/* Ad unit placeholder */}
      <div
        className="w-full max-w-sm h-64 rounded-2xl flex items-center justify-center"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {adsenseClient ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "100%" }}
            data-ad-client={adsenseClient}
            data-ad-slot="INTERSTITIAL_SLOT"
            data-ad-format="auto"
          />
        ) : (
          <p className="text-xs" style={{ color: "var(--color-subtle)" }}>
            Ad
          </p>
        )}
      </div>

      {/* Skip button with countdown */}
      <button
        onClick={countdown <= 0 ? handleSkip : undefined}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
        style={{
          background:
            countdown <= 0 ? "var(--color-primary)" : "var(--color-surface)",
          color: countdown <= 0 ? "white" : "var(--color-muted)",
          cursor: countdown <= 0 ? "pointer" : "not-allowed",
        }}
      >
        {countdown > 0 ? (
          <>
            <span className="relative flex items-center justify-center w-6 h-6">
              <svg
                className="absolute"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${((5 - countdown) / 5) * 62.8} 62.8`}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                />
              </svg>
              <span
                className="text-[10px] font-bold"
                style={{ color: "var(--color-primary)" }}
              >
                {countdown}
              </span>
            </span>
            Skip in {countdown}s
          </>
        ) : (
          <>
            <X size={16} /> Skip Ad
          </>
        )}
      </button>
    </div>
  );
}

export function BannerAd({
  slot = "BANNER_SLOT",
  className = "",
}: {
  slot?: string;
  className?: string;
}) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!adsenseClient) return null;

  return (
    <div
      className={`w-full overflow-hidden rounded-xl ${className}`}
      style={{ minHeight: "90px", background: "var(--color-surface)" }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
