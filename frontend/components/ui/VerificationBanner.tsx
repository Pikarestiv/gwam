"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/services";

export function VerificationBanner() {
  const { user, isAuthenticated, isVerified } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (!isAuthenticated || isVerified || dismissed) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification();
      setResent(true);
    } catch {}
    setResending(false);
  };

  return (
    <div
      className="w-full px-4 py-3 flex items-center gap-3 text-sm"
      style={{
        background: "rgba(124,58,237,0.15)",
        borderBottom: "1px solid rgba(124,58,237,0.3)",
      }}
    >
      <Mail
        size={16}
        style={{ color: "var(--color-primary)", flexShrink: 0 }}
      />
      <p className="flex-1" style={{ color: "var(--color-text)" }}>
        ⚠️ Verify your email to activate your inbox and Gwam link.{" "}
        <Link
          href="/verify-email"
          className="underline font-medium"
          style={{ color: "var(--color-primary)" }}
        >
          Enter OTP
        </Link>
        {" · "}
        {resent ? (
          <span style={{ color: "var(--color-success)" }}>Sent!</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="underline"
            style={{ color: "var(--color-muted)" }}
          >
            {resending ? "Sending…" : "Resend"}
          </button>
        )}
      </p>
      <button
        onClick={() => setDismissed(true)}
        style={{ color: "var(--color-muted)" }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
