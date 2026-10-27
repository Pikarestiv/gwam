"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { sendApi } from "@/lib/services";
import { track } from "@/lib/track";
import { useSenderSessionStore } from "@/lib/stores/senderSessionStore";
import { BannerAd, InterstitialAd } from "@/components/ui/AdComponents";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import Link from "next/link";
import { NudgeView } from "./NudgeView";
import { SenderPromptSheet } from "./SenderPromptSheet";
import { DeliveredScreen } from "./DeliveredScreen";

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
      track("message_sent");
      setDelivered(true);
      if ((sendCount + 1) % 3 === 0) {
        setShowInterstitial(true);
      }
      if (!promptShown) {
        setTimeout(() => {
          setShowPrompt(true);
          setPromptShown();
        }, 800);
      }
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
              Send @{username} a Gwa'm 👻
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              {profile.prompt ||
                "Say anything. Stay anonymous. No names, no judgment."}
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
                  <Send size={16} /> Send Gwa'm
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
          Get your own Gwa'm link — it&apos;s free 👻
        </Link>
      </div>
    </div>
  );
}
