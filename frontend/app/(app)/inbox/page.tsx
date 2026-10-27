"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { VerificationBanner } from "@/components/ui/VerificationBanner";
import { BannerAd } from "@/components/ui/AdComponents";
import { messagesApi } from "@/lib/services";
import { Inbox, ChevronLeft, ChevronRight, CheckCheck } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MessageCard, type Message } from "@/components/inbox/MessageCard";

export default function InboxPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["messages", page],
    queryFn: () => messagesApi.list(page).then((r) => r.data.data),
  });

  const messages: Message[] = (data?.data || []).filter(
    (m: Message) => !deletedIds.includes(m.id),
  );
  const lastPage = data?.last_page || 1;

  return (
    <AppShell title="Inbox">
      <VerificationBanner />
      <div className="page">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <Inbox size={20} style={{ color: "var(--color-primary)" }} /> Inbox
          </h1>
          {messages.some((m) => !m.is_read) && (
            <button
              onClick={() =>
                messages.forEach(
                  (m) =>
                    !m.is_read &&
                    messagesApi
                      .markRead(m.id)
                      .then(() =>
                        qc.invalidateQueries({ queryKey: ["messages"] }),
                      ),
                )
              }
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-muted)",
              }}
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div style={{ color: "var(--color-border)" }}>
              <Inbox size={48} />
            </div>
            <p
              className="mt-4 font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              No messages yet
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-subtle)" }}
            >
              Share your Gwa'm link to start receiving anonymous messages.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <>
                  <MessageCard
                    key={msg.id}
                    msg={msg}
                    onDelete={(id) => setDeletedIds((p) => [...p, id])}
                  />
                  {/* Banner ad every 5th message */}
                  {(i + 1) % 5 === 0 && (
                    <BannerAd key={`ad-${i}`} className="my-1" />
                  )}
                </>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl disabled:opacity-30"
              style={{ background: "var(--color-surface)" }}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              Page {page} of {lastPage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="p-2 rounded-xl disabled:opacity-30"
              style={{ background: "var(--color-surface)" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
