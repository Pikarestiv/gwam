"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/services";
import { GhostSVG } from "@/components/ui/GhostSVG";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div style={{ color: "var(--color-primary)" }}>
            <GhostSVG size={56} />
          </div>
          <h1
            className="text-2xl font-bold mt-3"
            style={{ color: "var(--color-text)" }}
          >
            Forgot password?
          </h1>
          <p
            className="text-sm mt-1 text-center"
            style={{ color: "var(--color-muted)" }}
          >
            Enter your email and we'll send a reset link.
          </p>
        </div>

        {sent ? (
          <div
            className="p-4 rounded-2xl text-center"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <p
              className="font-semibold"
              style={{ color: "var(--color-success)" }}
            >
              ✓ Reset link sent!
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Check your inbox and follow the link.
            </p>
          </div>
        ) : (
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
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          <Link href="/login" style={{ color: "var(--color-primary)" }}>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
