"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/stores/authStore";
import { profileApi } from "@/lib/services";
import { User, Copy, Check, Share2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || "https://app.gwam.dumostech.com";
  const link = `${APP_URL}/u/${user?.username}`;

  const updateMutation = useMutation({
    mutationFn: () => profileApi.update(form),
    onSuccess: (res) => {
      setUser(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <AppShell title="Profile">
      <div className="page max-w-sm">
        <h1
          className="text-xl font-bold mb-6 flex items-center gap-2"
          style={{ color: "var(--color-text)" }}
        >
          <User size={20} style={{ color: "var(--color-primary)" }} /> Profile
        </h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatar_seed || user.username}`}
            alt={user.name}
            className="w-24 h-24 rounded-full mb-3"
            style={{ background: "var(--color-surface-2)" }}
          />
          <p
            className="font-bold text-lg"
            style={{ color: "var(--color-text)" }}
          >
            {user.name}
          </p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            @{user.username}
          </p>
          {!user.email_verified_at && (
            <span className="badge-danger mt-2">Unverified</span>
          )}
        </div>

        {/* Gwam link */}
        <div className="card mb-6">
          <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
            Your Gwam link
          </p>
          <div className="flex items-center gap-2">
            <p
              className="flex-1 text-sm font-mono truncate"
              style={{ color: "var(--color-text)" }}
            >
              {link}
            </p>
            <button
              onClick={copyLink}
              className="p-2 rounded-lg"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-muted)",
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <Link
              href="/share"
              className="p-2 rounded-lg"
              style={{ color: "var(--color-primary)" }}
            >
              <Share2 size={16} />
            </Link>
          </div>
        </div>

        {/* Edit form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Display Name
            </label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Bio
            </label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Tell people a little about yourself…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary"
          >
            {saved
              ? "✓ Saved!"
              : updateMutation.isPending
                ? "Saving…"
                : "Save Profile"}
          </button>
        </form>

        {/* Email */}
        <div className="card mt-6">
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            Email
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text)" }}>
            {user.email}
          </p>
          {!user.email_verified_at && (
            <Link
              href="/verify-email"
              className="text-xs mt-2 block"
              style={{ color: "var(--color-primary)" }}
            >
              Verify email →
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
