"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { sendApi } from "@/lib/services";
import { GhostSVG } from "@/components/ui/GhostSVG";

export function NudgeView({ username }: { username: string }) {
  const [nudged, setNudged] = useState(false);
  const [nudging, setNudging] = useState(false);
  const [nudgeError, setNudgeError] = useState("");

  const handleNudge = async () => {
    setNudging(true);
    setNudgeError("");
    try {
      await sendApi.nudge(username);
      setNudged(true);
    } catch (err: any) {
      setNudgeError(
        err?.response?.data?.message || "Couldn't send nudge. Try again.",
      );
    }
    setNudging(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div style={{ color: "var(--color-border)" }}>
        <GhostSVG size={64} />
      </div>
      <h2
        className="text-xl font-bold mt-4"
        style={{ color: "var(--color-text)" }}
      >
        @{username} hasn&apos;t activated their inbox yet.
      </h2>
      <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
        They need to verify their email first.
      </p>

      {nudged ? (
        <div
          className="mt-6 px-5 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "var(--color-success)",
          }}
        >
          ✓ Nudge sent! They'll get an email letting them know someone wants to
          reach them.
        </div>
      ) : (
        <button
          onClick={handleNudge}
          disabled={nudging}
          className="mt-6 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <Bell size={15} style={{ color: "var(--color-primary)" }} />
          {nudging ? "Sending nudge…" : "Nudge them to verify 👻"}
        </button>
      )}

      {nudgeError && (
        <p className="text-xs mt-2" style={{ color: "var(--color-danger)" }}>
          {nudgeError}
        </p>
      )}

      <p className="text-xs mt-3" style={{ color: "var(--color-subtle)" }}>
        We&apos;ll email them saying someone tried to send a message — no
        details shared.
      </p>

      <Link href="/register" className="btn-primary mt-6 max-w-xs">
        Create your own Gwam →
      </Link>
    </div>
  );
}
