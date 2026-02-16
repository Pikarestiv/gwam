"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { GhostSVG } from "@/components/ui/GhostSVG";
import Link from "next/link";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import { PWAInstallBanner } from "@/components/ui/PWAInstallBanner";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.replace("/inbox");
  }, [isAuthenticated]);

  if (isAuthenticated) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="animate-float" style={{ color: "var(--color-primary)" }}>
        <GhostSVG size={80} />
      </div>
      <h1
        className="text-3xl font-bold mt-6"
        style={{ color: "var(--color-text)" }}
      >
        Gwam anything. 👻
      </h1>
      <p
        className="text-base mt-2 max-w-xs"
        style={{ color: "var(--color-muted)" }}
      >
        No names, no judgment. Send and receive anonymous messages.
      </p>
      <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
        <Link href="/register" className="btn-primary">
          Create free account
        </Link>
        <Link href="/login" className="btn-secondary">
          Sign in
        </Link>
      </div>
      <p className="text-xs mt-8" style={{ color: "var(--color-subtle)" }}>
        By Dumostech ·{" "}
        <Link href="/terms" style={{ color: "var(--color-primary)" }}>
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" style={{ color: "var(--color-primary)" }}>
          Privacy
        </Link>
      </p>
      <CookieConsentBanner />
      <PWAInstallBanner />
    </div>
  );
}
