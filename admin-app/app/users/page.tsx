"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Search, MoreHorizontal, Shield, Ban, CheckCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils"; // Need to copy this util or create it

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => adminApi.getUsers(page, search).then((r) => r.data.data),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: any }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const users = data?.data || [];
  const meta = data?.meta || { last_page: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <div className="relative w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search users..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isError ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-red-500">
                  Failed to load users. Please try again.
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          @{user.username}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_suspended
                          ? "bg-red-500/10 text-red-500"
                          : "bg-green-500/10 text-green-500"
                      }`}
                    >
                      {user.is_suspended ? (
                        <Ban size={12} />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      {user.is_suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: user.id,
                          status: { is_suspended: !user.is_suspended },
                        })
                      }
                      className="text-slate-400 hover:text-white transition-colors"
                      title={user.is_suspended ? "Unsuspend" : "Suspend"}
                    >
                      {user.is_suspended ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Ban size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
