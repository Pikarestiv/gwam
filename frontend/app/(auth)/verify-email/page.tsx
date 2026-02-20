"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/services";
import { GhostSVG } from "@/components/ui/GhostSVG";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.verifyEmail(otp);
      setUser(res.data.data.user);
      router.push("/inbox");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid or expired OTP. Try again.",
      );
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await authApi.resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to resend code. Try again.",
      );
    }
    setResending(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="animate-float"
            style={{ color: "var(--color-primary)" }}
          >
            <GhostSVG size={64} />
          </div>
          <h1
            className="text-2xl font-bold mt-3"
            style={{ color: "var(--color-text)" }}
          >
            Check your email 📬
          </h1>
          <p
            className="text-sm mt-1 text-center"
            style={{ color: "var(--color-muted)" }}
          >
            We sent a 6-digit code to your email. Enter it below to activate
            your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "var(--color-danger)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </div>
          )}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            className="input text-center text-3xl tracking-[0.5em] font-bold"
            placeholder="000000"
            required
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="btn-primary"
          >
            {loading ? "Verifying…" : "Verify Email ✓"}
          </button>
        </form>

        <div className="text-center mt-6">
          {resent ? (
            <p className="text-sm" style={{ color: "var(--color-success)" }}>
              ✓ New code sent! Check your inbox.
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm"
              style={{ color: "var(--color-muted)" }}
            >
              {resending ? "Sending…" : "Didn't get it? Resend code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
