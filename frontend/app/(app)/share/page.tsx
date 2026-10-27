"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { BannerAd } from "@/components/ui/AdComponents";
import { track } from "@/lib/track";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  Share2,
  Copy,
  MessageCircle,
  Twitter,
  Instagram,
  Check,
} from "lucide-react";

export default function SharePage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://gwam.dumostech.com/app";
  const link = user ? `${APP_URL}/u/${user.username}` : APP_URL;
  const waText = encodeURIComponent(
    `Gwa'm anything, I reply to all 👻 ${link}`,
  );
  const tweetText = encodeURIComponent(
    `Send me an anonymous message 👻 ${link} via @GwamApp`,
  );

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    track("link_copied");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      label: "WhatsApp",
      emoji: "💬",
      color: "#25D366",
      href: `https://wa.me/?text=${waText}`,
    },
    {
      label: "Twitter / X",
      emoji: "🐦",
      color: "#1DA1F2",
      href: `https://twitter.com/intent/tweet?text=${tweetText}`,
    },
  ];

  return (
    <AppShell title="Share">
      <div className="page max-w-sm">
        <h1
          className="text-xl font-bold mb-2 flex items-center gap-2"
          style={{ color: "var(--color-text)" }}
        >
          <Share2 size={20} style={{ color: "var(--color-primary)" }} /> Share
          your Gwa'm link
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          Share your link and start receiving anonymous messages.
        </p>

        {/* Link display */}
        <div className="card mb-6">
          <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
            Your Gwa'm link
          </p>
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: "var(--color-surface-2)" }}
          >
            <p
              className="flex-1 text-sm font-mono truncate"
              style={{ color: "var(--color-text)" }}
            >
              {link}
            </p>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex-shrink-0"
              style={{
                background: copied
                  ? "var(--color-success)"
                  : "var(--color-primary)",
              }}
            >
              {copied ? (
                <>
                  <Check size={12} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex flex-col gap-3">
          {shareOptions.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl font-semibold text-white transition-all active:scale-95"
              style={{ background: opt.color }}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span>Share on {opt.label}</span>
            </a>
          ))}

          {/* Instagram — copy + tooltip */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📸</span>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Instagram
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Paste this link in your Instagram bio
                </p>
              </div>
            </div>
            <button onClick={copyLink} className="btn-secondary text-sm py-2">
              {copied ? "✓ Copied!" : "Copy link for bio"}
            </button>
          </div>
          <BannerAd />
        </div>
      </div>
    </AppShell>
  );
}
