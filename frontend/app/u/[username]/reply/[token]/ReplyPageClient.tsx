"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sendApi } from "@/lib/services";
import { GhostSVG } from "@/components/ui/GhostSVG";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default function ReplyPageClient() {
  const params = useParams();
  const username = params.username as string;
  const token = params.token as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reply", token],
    queryFn: () => sendApi.viewReply(token).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div
          className="animate-float"
          style={{ color: "var(--color-primary)" }}
        >
          <GhostSVG size={48} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
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
          Reply not found
        </h2>
        <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
          This link may have expired or the message was deleted.
        </p>
        <Link
          href={`/u/${username}`}
          className="btn-primary mt-6 max-w-xs block text-center"
        >
          Send another Gwam →
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div style={{ color: "var(--color-primary)" }}>
            <GhostSVG size={56} />
          </div>
          <h1
            className="text-xl font-bold mt-3"
            style={{ color: "var(--color-text)" }}
          >
            @{username} replied to your Gwam 👻
          </h1>
        </div>
        <div className="card mb-4">
          <p className="text-xs mb-2" style={{ color: "var(--color-muted)" }}>
            Your anonymous message:
          </p>
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            {data.content}
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--color-subtle)" }}>
            {formatRelativeTime(data.created_at)}
          </p>
        </div>
        {data.reply_text ? (
          <div
            className="card"
            style={{
              borderColor: "var(--color-primary)",
              boxShadow: "0 0 12px var(--color-primary-glow)",
            }}
          >
            <p
              className="text-xs mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              @{username}&apos;s reply:
            </p>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              {data.reply_text}
            </p>
          </div>
        ) : (
          <div className="card text-center">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              @{username} hasn&apos;t replied yet. Check back later!
            </p>
          </div>
        )}
        <Link
          href={`/u/${username}`}
          className="btn-secondary mt-6 block text-center"
        >
          Send another Gwam 👻
        </Link>
        <Link
          href="/register"
          className="text-sm text-center block mt-3"
          style={{ color: "var(--color-muted)" }}
        >
          Get your own Gwam inbox →
        </Link>
      </div>
    </div>
  );
}
