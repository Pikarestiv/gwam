"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { sendApi } from "@/lib/services";
import { useSenderSessionStore } from "@/lib/stores/senderSessionStore";

export function SenderPromptSheet({
  username,
  messageId,
  onClose,
}: {
  username: string;
  messageId: number;
  onClose: () => void;
}) {
  const { senderToken } = useSenderSessionStore();
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveEmail = async () => {
    if (!email || !senderToken) return;
    setSaving(true);
    try {
      await sendApi.saveSenderInterest(messageId, email, senderToken);
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
