"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/stores/authStore";
import { useThemeStore } from "@/lib/stores/themeStore";
import { settingsApi, authApi } from "@/lib/services";
import { Settings, Moon, Clock, Trash2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const themes = [
  {
    id: "gwam_dark",
    label: "Gwam Dark",
    desc: "Electric purple · Neon cyan",
    color: "#7c3aed",
  },
  {
    id: "neon_magenta",
    label: "Neon Magenta",
    desc: "Hot pink · Electric blue",
    color: "#f72585",
  },
  {
    id: "soft_dark",
    label: "Soft Dark",
    desc: "Lavender · Mint green",
    color: "#a78bfa",
  },
] as const;

const retentionOptions = [
  { value: 1, label: "1 month" },
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months (default)" },
  { value: 12, label: "1 year" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [retention, setRetention] = useState(
    user?.message_retention_months || 6,
  );
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () =>
      settingsApi.update({
        theme_preference: theme,
        message_retention_months: retention,
      }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    logout();
    router.push("/login");
  };

  return (
    <AppShell title="Settings">
      <div className="page max-w-sm">
        <h1
          className="text-xl font-bold mb-6 flex items-center gap-2"
          style={{ color: "var(--color-text)" }}
        >
          <Settings size={20} style={{ color: "var(--color-primary)" }} />{" "}
          Settings
        </h1>

        {/* Theme */}
        <section className="mb-6">
          <h2
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--color-muted)" }}
          >
            <Moon size={14} /> Theme
          </h2>
          <div className="flex flex-col gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="card flex items-center gap-3 text-left transition-all"
                style={{
                  borderColor:
                    theme === t.id
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  boxShadow:
                    theme === t.id
                      ? "0 0 12px var(--color-primary-glow)"
                      : "none",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ background: t.color }}
                />
                <div>
                  <p
                    className="font-medium text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    {t.label}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {t.desc}
                  </p>
                </div>
                {theme === t.id && (
                  <span
                    className="ml-auto text-xs font-bold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Message retention */}
        <section className="mb-6">
          <h2
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: "var(--color-muted)" }}
          >
            <Clock size={14} /> Message Retention
          </h2>
          <div className="card">
            <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>
              Messages are automatically deleted after this period.
            </p>
            <div className="flex flex-col gap-2">
              {retentionOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRetention(opt.value)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background:
                      retention === opt.value
                        ? "var(--color-primary-glow)"
                        : "var(--color-surface-2)",
                    color:
                      retention === opt.value
                        ? "var(--color-primary)"
                        : "var(--color-text)",
                  }}
                >
                  {opt.label}
                  {retention === opt.value && <span>✓</span>}
                </button>
              ))}
              <button
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
                style={{
                  background: "var(--color-surface-2)",
                  color: "var(--color-subtle)",
                }}
              >
                Never delete{" "}
                <span className="badge-primary text-xs">Premium</span>
              </button>
            </div>
          </div>
        </section>

        {/* Save */}
        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="btn-primary mb-4"
        >
          {saved
            ? "✓ Saved!"
            : updateMutation.isPending
              ? "Saving…"
              : "Save Settings"}
        </button>

        {/* Danger zone */}
        <section>
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--color-danger)" }}
          >
            Account
          </h2>
          <button
            onClick={handleLogout}
            className="card w-full flex items-center gap-3 text-left transition-all hover:border-danger"
            style={{ color: "var(--color-danger)" }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </section>
      </div>
    </AppShell>
  );
}
