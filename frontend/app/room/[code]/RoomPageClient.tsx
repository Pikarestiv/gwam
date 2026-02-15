"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy } from "lucide-react";
import { roomsApi } from "@/lib/services";
import {
  generateGhostAlias,
  generateSessionToken,
  formatRelativeTime,
} from "@/lib/utils";
import { GhostSVG } from "@/components/ui/GhostSVG";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";

const SESSION_TOKEN = generateSessionToken();
const GHOST_ALIAS = generateGhostAlias();

export default function RoomPageClient() {
  const params = useParams();
  const code = params.code as string;
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["room", code],
    queryFn: () => roomsApi.get(code).then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  const room = data?.room;
  const messages = data?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: () =>
      roomsApi.sendMessage(code, { content, session_token: SESSION_TOKEN }),
    onSuccess: () => {
      setContent("");
      qc.invalidateQueries({ queryKey: ["room", code] });
      if (typeof window !== "undefined" && (window as any).umami)
        (window as any).umami.track("room_message_sent");
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  if (isError || !room) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div style={{ color: "var(--color-border)" }}>
          <GhostSVG size={64} />
        </div>
        <p
          className="mt-4 font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          Room not found
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <header
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div>
          <h1 className="font-bold" style={{ color: "var(--color-text)" }}>
            {room.name}
          </h1>
          {room.topic && (
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              {room.topic}
            </p>
          )}
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
          style={{
            background: "var(--color-surface-2)",
            color: copied ? "var(--color-success)" : "var(--color-muted)",
          }}
        >
          <Copy size={13} /> {copied ? "Copied!" : "Share"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
            <div style={{ color: "var(--color-border)" }}>
              <GhostSVG size={48} />
            </div>
            <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
              No messages yet. Be the first ghost! 👻
            </p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg: any) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.session_token === SESSION_TOKEN ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%]">
                <p
                  className="text-xs mb-1"
                  style={{ color: "var(--color-subtle)" }}
                >
                  {msg.session_token === SESSION_TOKEN ? "You" : msg.ghost_name}
                </p>
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm"
                  style={{
                    background:
                      msg.session_token === SESSION_TOKEN
                        ? "var(--color-primary)"
                        : "var(--color-surface)",
                    color:
                      msg.session_token === SESSION_TOKEN
                        ? "white"
                        : "var(--color-text)",
                    border:
                      msg.session_token === SESSION_TOKEN
                        ? "none"
                        : "1px solid var(--color-border)",
                  }}
                >
                  {msg.content}
                </div>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: "var(--color-subtle)" }}
                >
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {room.is_readonly ? (
        <div
          className="px-4 py-3 text-center text-sm border-t"
          style={{
            color: "var(--color-muted)",
            borderColor: "var(--color-border)",
          }}
        >
          This room is read-only.
        </div>
      ) : (
        <div
          className="px-4 py-3 border-t flex gap-2 flex-shrink-0"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <input
            type="text"
            className="input flex-1 py-2.5 text-sm"
            placeholder={`Message as ${GHOST_ALIAS}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && content.trim()) {
                e.preventDefault();
                sendMutation.mutate();
              }
            }}
            maxLength={500}
          />
          <button
            onClick={() => sendMutation.mutate()}
            disabled={!content.trim() || sendMutation.isPending}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
            style={{ background: "var(--color-primary)" }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      )}
      <CookieConsentBanner />
    </div>
  );
}
