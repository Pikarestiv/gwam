"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { roomsApi } from "@/lib/services";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", topic: "", password: "" });
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      roomsApi.create({
        name: form.name,
        topic: form.topic || undefined,
        password: form.password || undefined,
      }),
    onSuccess: (res) => {
      const code = res.data.data.code;
      router.push(`/room/${code}`);
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || "Failed to create room."),
  });

  return (
    <AppShell title="New Room">
      <div className="page max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/rooms" style={{ color: "var(--color-muted)" }}>
            <ArrowLeft size={20} />
          </Link>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Create a Room
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "var(--color-danger)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </div>
          )}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Room Name *
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Confessions, Hot Takes…"
              required
              maxLength={80}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Topic (optional)
            </label>
            <input
              type="text"
              className="input"
              placeholder="What's this room about?"
              maxLength={200}
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              Password (optional)
            </label>
            <input
              type="password"
              className="input"
              placeholder="Leave blank for open room"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-subtle)" }}
            >
              Anyone with the link can join. Add a password to restrict access.
            </p>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary mt-2"
          >
            {createMutation.isPending ? "Creating…" : "Create Room 👻"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
