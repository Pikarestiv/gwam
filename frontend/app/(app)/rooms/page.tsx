"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Users, Share2, Lock, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { VerificationBanner } from "@/components/ui/VerificationBanner";
import { roomsApi } from "@/lib/services";
import { formatRelativeTime } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";

export default function RoomsPage() {
  const { isVerified } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomsApi.list().then((r) => r.data.data),
  });

  const rooms = data || [];

  return (
    <AppShell title="Rooms">
      <VerificationBanner />
      <div className="page">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <Users size={20} style={{ color: "var(--color-primary)" }} /> Rooms
          </h1>
          {isVerified ? (
            <Link
              href="/rooms/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--color-primary)" }}
            >
              <Plus size={16} /> New Room
            </Link>
          ) : (
            <span
              className="text-xs px-3 py-1.5 rounded-xl"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-muted)",
              }}
            >
              Verify email to create rooms
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Users size={48} style={{ color: "var(--color-border)" }} />
            <p
              className="mt-4 font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              No rooms yet
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-subtle)" }}
            >
              Create an anonymous group room and share the link.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rooms.map((room: any) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link
                  href={`/room/${room.code}`}
                  className="card flex items-center gap-4 hover:border-primary transition-colors block"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--color-primary-glow)" }}
                  >
                    <MessageSquare
                      size={18}
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="font-semibold truncate"
                        style={{ color: "var(--color-text)" }}
                      >
                        {room.name}
                      </p>
                      {room.password_hash && (
                        <Lock
                          size={12}
                          style={{ color: "var(--color-muted)" }}
                        />
                      )}
                    </div>
                    {room.topic && (
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {room.topic}
                      </p>
                    )}
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-subtle)" }}
                    >
                      {room.messages_count || 0} messages ·{" "}
                      {formatRelativeTime(
                        room.last_activity_at || room.created_at,
                      )}
                    </p>
                  </div>
                  <Share2 size={16} style={{ color: "var(--color-muted)" }} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
