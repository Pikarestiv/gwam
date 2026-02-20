"use client";

import { GhostSVG } from "@/components/ui/GhostSVG";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-8" style={{ color: "var(--color-primary)" }}>
        <GhostSVG size={80} />
      </div>

      <h1 className="text-3xl font-bold mb-4 text-white">
        We'll Be Right Back!
      </h1>

      <p className="text-muted max-w-sm mx-auto mb-8 leading-relaxed">
        Gwam is currently undergoing scheduled maintenance to improve your
        experience. We should be back online shortly! 👻
      </p>

      <button
        onClick={() => (window.location.href = "/")}
        className="btn-primary max-w-[200px]"
      >
        Retry
      </button>
    </div>
  );
}
