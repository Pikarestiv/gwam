"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { VerificationBanner } from "@/components/ui/VerificationBanner";
import { BannerAd } from "@/components/ui/AdComponents";
import { messagesApi } from "@/lib/services";
import { formatRelativeTime } from "@/lib/utils";
import {
  Inbox,
  Trash2,
  Reply,
  Eye,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  content: string;
  is_read: boolean;
  is_flagged: boolean;
  reply_text: string | null;
  created_at: string;
  sender_token: string;
}

function MessageCard({
  msg,
  onDelete,
}: {
  msg: Message;
  onDelete: (id: number) => void;
}) {
  const qc = useQueryClient();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState(msg.reply_text || "");
  const [showReveal, setShowReveal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const markRead = useMutation({
    mutationFn: () => messagesApi.markRead(msg.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });

  const replyMutation = useMutation({
    mutationFn: (text: string) => messagesApi.reply(msg.id, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      setShowReply(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => messagesApi.delete(msg.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      onDelete(msg.id);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`card ${!msg.is_read ? "glow-border" : ""}`}
      onMouseEnter={() => {
        if (!msg.is_read) markRead.mutate();
      }}
    >
      {/* Unread dot */}
      {!msg.is_read && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--color-primary)" }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            New
          </span>
        </div>
      )}

      <p
        className="text-sm leading-relaxed mb-3"
        style={{ color: "var(--color-text)" }}
      >
        {msg.content}
      </p>

      {/* Reply preview */}
      {msg.reply_text && (
        <div
          className="mb-3 p-3 rounded-xl text-sm"
          style={{
            background: "var(--color-surface-2)",
            borderLeft: "3px solid var(--color-primary)",
          }}
        >
          <p className="text-xs mb-1" style={{ color: "var(--color-muted)" }}>
            Your reply:
          </p>
          <p style={{ color: "var(--color-text)" }}>{msg.reply_text}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--color-subtle)" }}>
          {formatRelativeTime(msg.created_at)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowReply(!showReply)}
            title="Reply"
            className="p-1.5 rounded-lg transition-colors hover:bg-surface-2"
            style={{ color: "var(--color-muted)" }}
          >
            <Reply size={15} />
          </button>
          <button
            onClick={() => setShowReveal(true)}
            title="Get Hint"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--color-secondary)" }}
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setShowReport(true)}
            title="Report"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            <Flag size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this message?")) deleteMutation.mutate();
            }}
            title="Delete"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--color-danger)" }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Inline reply composer */}
      <AnimatePresence>
        {showReply && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 overflow-hidden"
          >
            <textarea
              className="textarea text-sm"
              rows={3}
              placeholder="Write your reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => replyMutation.mutate(replyText)}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="btn-primary py-2 text-sm"
              >
                {replyMutation.isPending ? "Sending…" : "Send Reply"}
              </button>
              <button
                onClick={() => setShowReply(false)}
                className="btn-secondary py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal hint modal */}
      <AnimatePresence>
        {showReveal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReveal(false)}
          >
            <motion.div
              className="card w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "var(--color-text)" }}
              >
                🔍 Get Hint
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--color-muted)" }}
              >
                Find out more about who Gwam'd you — their country, city, device
                type, and browser.
                <br />
                <br />
                <strong style={{ color: "var(--color-text)" }}>
                  Small fee: ₦200 (or $0.50)
                </strong>
                <br />
                <span className="text-xs">
                  We never reveal full identity — just metadata.
                </span>
              </p>
              <button
                className="btn-primary text-sm py-2.5"
                onClick={() => setShowReveal(false)}
              >
                🔔 Notify me when available
              </button>
              <button
                onClick={() => setShowReveal(false)}
                className="btn-ghost w-full mt-2 text-sm"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
              Share your Gwam link to start receiving anonymous messages.
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
