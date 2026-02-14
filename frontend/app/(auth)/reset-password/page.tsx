"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/services";
import { GhostSVG } from "@/components/ui/GhostSVG";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
    token: params.get("token") || "",
    email: params.get("email") || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(form);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Reset failed. The link may have expired.",
      );
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div
        className="p-4 rounded-2xl text-center"
        style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
        }}
      >
        <p className="font-semibold" style={{ color: "var(--color-success)" }}>
          ✓ Password reset! Redirecting…
        </p>
      </div>
    );
  }

  return (
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
        type="password"
        className="input"
        placeholder="New password (min 8 chars)"
        required
        minLength={8}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <input
        type="password"
        className="input"
        placeholder="Confirm new password"
        required
        value={form.password_confirmation}
        onChange={(e) =>
          setForm({ ...form, password_confirmation: e.target.value })
        }
      />
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Resetting…" : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            Set new password 🔐
          </h1>
        </div>
        <Suspense fallback={<div className="skeleton h-32 rounded-2xl" />}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm mt-6">
          <Link href="/login" style={{ color: "var(--color-primary)" }}>
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
