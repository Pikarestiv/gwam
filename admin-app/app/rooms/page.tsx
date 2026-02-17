"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Home, Trash2, Users } from "lucide-react";

export default function RoomsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-rooms", page],
    queryFn: () => adminApi.getRooms(page).then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteRoom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-rooms"] }),
  });

  const rooms = data?.data || [];
  const meta = data?.meta || { last_page: 1 };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Rooms</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-slate-500 col-span-full text-center py-8">
            Loading rooms...
          </p>
        ) : rooms.length === 0 ? (
          <p className="text-slate-500 col-span-full text-center py-8">
            No rooms found.
          </p>
        ) : (
          rooms.map((room: any) => (
            <div key={room.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                    <Home size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{room.name}</h3>
                    <p className="text-xs text-slate-500">#{room.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Delete this room?"))
                      deleteMutation.mutate(room.id);
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2 text-sm text-slate-400">
                <p className="line-clamp-2 italic">
                  "{room.topic || "No topic"}"
                </p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{room.active_users_count || 0} active</span>
                  </div>
                  {/* Additional stats could go here */}
                </div>
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
