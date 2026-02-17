"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api"; // Using adminApi from lib/api.ts which we created
import { Trash2, Check, AlertTriangle } from "lucide-react";

export default function FlaggedMessagesPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-flagged-messages", page],
    queryFn: () => adminApi.getFlaggedMessages(page).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteMessage(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-flagged-messages"] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveMessage(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-flagged-messages"] }),
  });

  const messages = data?.data || [];
  const meta = data?.meta || { last_page: 1 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <AlertTriangle className="text-yellow-500" />
        Flagged Messages
      </h1>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-slate-500 text-center py-8">
            Loading flagged messages...
          </p>
        ) : messages.length === 0 ? (
          <div className="card text-center py-12">
            <Check className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-slate-400">
              All caught up! No flagged messages.
            </p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className="card flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400">
                    To: @{msg.recipient?.username}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white text-lg font-medium p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                  {msg.content}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-slate-500">
                  <span>IP: {msg.sender_ip}</span>
                  <span>Country: {msg.sender_country}</span>
                </div>
              </div>

              <div className="flex gap-2 self-end md:self-center">
                <button
                  onClick={() => approveMutation.mutate(msg.id)}
                  className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-sm font-medium flex items-center gap-2"
                >
                  <Check size={16} /> Keep
                </button>
                <button
                  onClick={() => deleteMutation.mutate(msg.id)}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-50 text-sm"
        >
          Previous
        </button>
        <button
          disabled={page === meta.last_page}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-50 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
