"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSenderSessionStore } from "@/lib/stores/senderSessionStore";
import { BannerAd } from "@/components/ui/AdComponents";
import { GhostSVG } from "@/components/ui/GhostSVG";

export function DeliveredScreen({
  username,
  messageId,
  onReset,
}: {
  username: string;
  messageId: number;
  onReset: () => void;
}) {
  const { senderToken } = useSenderSessionStore();
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="animate-float" style={{ color: "var(--color-primary)" }}>
        <GhostSVG size={80} />
      </div>
      <h2
        className="text-2xl font-bold mt-6"
        style={{ color: "var(--color-text)" }}
      >
        Message delivered 👻
      </h2>
      <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
        @{username} will see it anonymously. No names, no judgment.
      </p>
      {senderToken && (
        <Link
          href={`/u/${username}/reply/${senderToken}`}
          className="mt-4 text-sm underline"
          style={{ color: "var(--color-secondary)" }}
        >
          Check for a reply later →
        </Link>
      )}
      <button onClick={onReset} className="btn-primary mt-8 max-w-xs">
        Send another 👻
      </button>
      <BannerAd className="mt-8 max-w-sm" />
    </motion.div>
  );
}
