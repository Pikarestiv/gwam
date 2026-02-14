"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/services";
import { GhostSVG } from "@/components/ui/GhostSVG";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");
    try {
      const res = await authApi.register(form);
      const { user, token } = res.data.data;
      setAuth(user, token);
      router.push("/verify-email");
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGlobalError(
          err.response?.data?.message ||
            "Registration failed. Please try again.",
        );
      }
    }
    setLoading(false);
  };

  const field = (
    key: keyof typeof form,
    label: string,
    type = "text",
    placeholder = "",
  ) => (
    <div>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--color-muted)" }}
      >
        {label}
      </label>
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        required
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {errors[key] && (
        <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
          {errors[key][0]}
        </p>
      )}
    </div>
  );

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
            Create your Gwam 👻
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Free forever. No judgment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {globalError && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "var(--color-danger)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {globalError}
            </div>
          )}
          {field("name", "Full Name", "text", "Your name")}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Username
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--color-subtle)" }}
              >
                @
              </span>
              <input
                type="text"
                className="input pl-7"
                placeholder="yourname"
                required
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  })
                }
              />
            </div>
            {errors.username && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-danger)" }}
              >
                {errors.username[0]}
              </p>
            )}
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-subtle)" }}
            >
              app.gwam.dumostech.com/u/{form.username || "yourname"}
            </p>
          </div>
          {field("email", "Email", "email", "you@example.com")}
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
                placeholder="Min 8 characters"
                required
                minLength={8}
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
            {errors.password && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-danger)" }}
              >
                {errors.password[0]}
              </p>
            )}
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Confirm Password
            </label>
            <input
              type={showPw ? "text" : "password"}
              className="input"
              placeholder="Repeat password"
              required
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Creating account…" : "Create Free Account 👻"}
          </button>
          <p
            className="text-center text-xs"
            style={{ color: "var(--color-subtle)" }}
          >
            By signing up, you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--color-primary)" }}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" style={{ color: "var(--color-primary)" }}>
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--color-muted)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
