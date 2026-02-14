"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/services";
import { GhostSVG } from "@/components/ui/GhostSVG";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      router.push("/inbox");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Check your credentials.",
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
        {/* Logo */}
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
            Welcome back 👻
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Sign in to your Gwam account
          </p>
        </div>

        {/* Form */}
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
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Email
            </label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-muted)" }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm"
              style={{ color: "var(--color-primary)" }}
            >
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-muted)" }}
        >
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
