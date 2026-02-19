"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Mail, UserPlus, Bell } from "lucide-react";
import { sendApi } from "@/lib/services";
import { useSenderSessionStore } from "@/lib/stores/senderSessionStore";
import { GhostSVG } from "@/components/ui/GhostSVG";
import { BannerAd, InterstitialAd } from "@/components/ui/AdComponents";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import Link from "next/link";

function NudgeView({ username }: { username: string }) {
  const [nudged, setNudged] = useState(false);
  const [nudging, setNudging] = useState(false);
  const [nudgeError, setNudgeError] = useState("");

  const handleNudge = async () => {
    setNudging(true);
    setNudgeError("");
    try {
      await sendApi.nudge(username);
      setNudged(true);
    } catch (err: any) {
      setNudgeError(
        err?.response?.data?.message || "Couldn't send nudge. Try again.",
      );
    }
    setNudging(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div style={{ color: "var(--color-border)" }}>
        <GhostSVG size={64} />
      </div>
      <h2
        className="text-xl font-bold mt-4"
        style={{ color: "var(--color-text)" }}
      >
        @{username} hasn&apos;t activated their inbox yet.
      </h2>
      <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
        They need to verify their email first.
      </p>

      {nudged ? (
        <div
          className="mt-6 px-5 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "var(--color-success)",
          }}
        >
          ✓ Nudge sent! They'll get an email letting them know someone wants to
          reach them.
        </div>
      ) : (
        <button
          onClick={handleNudge}
          disabled={nudging}
          className="mt-6 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <Bell size={15} style={{ color: "var(--color-primary)" }} />
          {nudging ? "Sending nudge…" : "Nudge them to verify 👻"}
        </button>
      )}

      {nudgeError && (
        <p className="text-xs mt-2" style={{ color: "var(--color-danger)" }}>
          {nudgeError}
        </p>
      )}

      <p className="text-xs mt-3" style={{ color: "var(--color-subtle)" }}>
        We&apos;ll email them saying someone tried to send a message — no
        details shared.
      </p>

      <Link href="/register" className="btn-primary mt-6 max-w-xs">
        Create your own Gwam →
      </Link>
    </div>
  );
}

function SenderPromptSheet({
  username,
  messageId,
  onClose,
}: {
  username: string;
  messageId: number;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveEmail = async () => {
    if (!email) return;
    setSaving(true);
    try {
      await sendApi.saveSenderInterest(messageId, email);
      setSaved(true);
    } catch {}
    setSaving(false);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--color-text)" }}
            >
              👻 Want to know when @{username} reads your message?
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Leave your email and we&apos;ll notify you — or create a free Gwam
              account.
            </p>
          </div>
          <button onClick={onClose} style={{ color: "var(--color-muted)" }}>
            <X size={20} />
          </button>
        </div>
        {saved ? (
          <div
            className="p-3 rounded-xl text-center"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <p style={{ color: "var(--color-success)" }}>
              ✓ We&apos;ll notify you when they read it!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                className="text-sm font-medium mb-2 flex items-center gap-2"
                style={{ color: "var(--color-text)" }}
              >
                <Mail size={15} /> Notify me by email
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  className="input text-sm py-2 flex-1"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={saveEmail}
                  disabled={!email || saving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {saving ? "…" : "OK"}
                </button>
              </div>
            </div>
            <Link
              href="/register"
              className="flex items-center gap-3 p-4 rounded-2xl transition-all"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <UserPlus size={18} style={{ color: "var(--color-primary)" }} />
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  Create free account
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Get your own inbox, track replies, and more
                </p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="text-sm py-2"
              style={{ color: "var(--color-subtle)" }}
            >
              Stay fully anonymous →
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function DeliveredScreen({
  username,
  messageId,
  onReset,
}: {
  username: string;
  messageId: number;
  onReset: () => void;
}) {
  const { senderToken } = useSenderSessionStore();
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="animate-float" style={{ color: "var(--color-primary)" }}>
        <GhostSVG size={80} />
      </div>
      <h2
        className="text-2xl font-bold mt-6"
        style={{ color: "var(--color-text)" }}
      >
        Message delivered 👻
      </h2>
      <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
        @{username} will see it anonymously. No names, no judgment.
      </p>
      {senderToken && (
        <Link
          href={`/u/${username}/reply/${senderToken}`}
          className="mt-4 text-sm underline"
          style={{ color: "var(--color-secondary)" }}
        >
          Check for a reply later →
        </Link>
      )}
      <button onClick={onReset} className="btn-primary mt-8 max-w-xs">
        Send another 👻
      </button>
    </motion.div>
  );
}

export default function SendPageClient() {
  const params = useParams();
  // In static export, useParams() returns the pre-built placeholder '_'
  // when served via .htaccess for a real username. Read from window.location instead.
  const rawUsername = params.username as string;
  const username = (() => {
    if (typeof window !== "undefined" && rawUsername === "_") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const uIndex = parts.indexOf("u");
      if (uIndex !== -1 && parts[uIndex + 1] && parts[uIndex + 1] !== "_") {
        return parts[uIndex + 1];
      }
    }
    return rawUsername;
  })();
  const {
    incrementSendCount,
    sendCount,
    promptShown,
    setPromptShown,
    setSenderToken,
  } = useSenderSessionStore();

  const [content, setContent] = useState("");
  const [delivered, setDelivered] = useState(false);
  const [messageId, setMessageId] = useState<number | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const MAX_CHARS = 500;

  const {
    data: profileData,
    isLoading: profileLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => sendApi.getProfile(username).then((r) => r.data.data),
  });

  const sendMutation = useMutation({
    mutationFn: () => sendApi.sendMessage(username, { content }),
    onSuccess: (res) => {
      const { message_id, sender_token } = res.data.data;
      setMessageId(message_id);
      if (sender_token) setSenderToken(sender_token);
      incrementSendCount();
      setDelivered(true);
      if ((sendCount + 1) % 3 === 0) {
        setShowInterstitial(true);
        if (typeof window !== "undefined" && (window as any).umami)
          (window as any).umami.track("ad_interstitial_shown");
      }
      if (!promptShown) {
        setTimeout(() => {
          setShowPrompt(true);
          setPromptShown();
        }, 800);
      }
      if (typeof window !== "undefined" && (window as any).umami)
        (window as any).umami.track("message_sent");
    },
  });

  if (profileLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="skeleton w-full max-w-sm h-64 rounded-2xl mx-4" />
      </div>
    );
  }

  if (isError || !profileData?.inbox_active) {
    return <NudgeView username={username} />;
  }

  if (delivered && messageId) {
    return (
      <>
        {showInterstitial && (
          <InterstitialAd onClose={() => setShowInterstitial(false)} />
        )}
        <AnimatePresence>
          {showPrompt && (
            <SenderPromptSheet
              username={username}
              messageId={messageId}
              onClose={() => setShowPrompt(false)}
            />
          )}
        </AnimatePresence>
        <div style={{ background: "var(--color-bg)" }} className="min-h-screen">
          <DeliveredScreen
            username={username}
            messageId={messageId}
            onReset={() => {
              setDelivered(false);
              setContent("");
              setMessageId(null);
            }}
          />
        </div>
      </>
    );
  }

  const profile = profileData;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profile.avatar_seed || username}`}
              alt={profile.name}
              className="w-20 h-20 rounded-full mb-3"
              style={{ background: "var(--color-surface)" }}
            />
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Send @{username} a Gwam 👻
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Say anything. Stay anonymous. No names, no judgment.
            </p>
          </div>
          <div className="card">
            <textarea
              className="textarea w-full mb-2"
              placeholder={`Say something to @${username}…`}
              maxLength={MAX_CHARS}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs"
                style={{
                  color:
                    content.length > MAX_CHARS * 0.9
                      ? "var(--color-danger)"
                      : "var(--color-subtle)",
                }}
              >
                {content.length}/{MAX_CHARS}
              </span>
            </div>
            <button
              onClick={() => sendMutation.mutate()}
              disabled={!content.trim() || sendMutation.isPending}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {sendMutation.isPending ? (
                "Sending…"
              ) : (
                <>
                  <Send size={16} /> Send Gwam
                </>
              )}
            </button>
            {sendMutation.isError && (
              <p
                className="text-xs text-center mt-2"
                style={{ color: "var(--color-danger)" }}
              >
                {(sendMutation.error as any)?.response?.data?.message ||
                  "Failed to send. Try again."}
              </p>
            )}
            <p
              className="text-xs text-center mt-3"
              style={{ color: "var(--color-subtle)" }}
            >
              By sending, you agree to our{" "}
              <Link href="/terms" style={{ color: "var(--color-primary)" }}>
                Terms
              </Link>
              . Abusive messages are logged and may be reported.
            </p>
          </div>
          <BannerAd className="mt-4" />
        </div>
      </div>
      <CookieConsentBanner />
      <div className="text-center py-4">
        <Link
          href="/register"
          className="text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          Get your own Gwam link — it&apos;s free 👻
        </Link>
      </div>
    </div>
  );
}
