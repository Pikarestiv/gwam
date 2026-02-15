"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { notificationsApi } from "@/lib/services";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { formatRelativeTime } from "@/lib/utils";

const typeEmoji: Record<string, string> = {
  message_received: "👻",
  reply_received: "💬",
  room_activity: "🏠",
  system: "📢",
};

export default function NotificationsPage() {
  const { setNotifications, setUnreadCount, markAllRead } =
    useNotificationStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((r) => r.data.data),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      markAllRead();
      refetch();
    },
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.data || data);
      setUnreadCount((data.data || data).filter((n: any) => !n.read_at).length);
    }
  }, [data]);

  const notifications = data?.data || data || [];

  return (
    <AppShell title="Notifications">
      <div className="page">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <Bell size={20} style={{ color: "var(--color-primary)" }} />{" "}
            Notifications
          </h1>
          {notifications.some((n: any) => !n.read_at) && (
            <button
              onClick={() => markAllMutation.mutate()}
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
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Bell size={48} style={{ color: "var(--color-border)" }} />
            <p
              className="mt-4 font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {notifications.map((n: any) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`card flex items-start gap-3 ${!n.read_at ? "glow-border" : ""}`}
                >
                  <span className="text-xl flex-shrink-0">
                    {typeEmoji[n.type] || "📢"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {n.data?.text || n.type.replace(/_/g, " ")}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-subtle)" }}
                    >
                      {formatRelativeTime(n.created_at)}
                    </p>
                  </div>
                  {!n.read_at && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: "var(--color-primary)" }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppShell>
  );
}
