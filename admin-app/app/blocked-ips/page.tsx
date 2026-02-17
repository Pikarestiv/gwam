"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { ShieldAlert, Trash2, Plus } from "lucide-react";

export default function BlockedIpsPage() {
  const qc = useQueryClient();
  const [newIp, setNewIp] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blocked-ips"],
    queryFn: () => adminApi.getBlockedIps().then((r) => r.data.data),
  });

  const unblockMutation = useMutation({
    mutationFn: (id: number) => adminApi.unblockIp(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blocked-ips"] }),
  });

  const blockMutation = useMutation({
    mutationFn: (ip: string) => adminApi.blockIp(ip),
    onSuccess: () => {
      setNewIp("");
      qc.invalidateQueries({ queryKey: ["admin-blocked-ips"] });
    },
  });

  const ips = data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <ShieldAlert className="text-red-500" />
        Blocked IPs
      </h1>

      <div className="card max-w-md">
        <h3 className="text-sm font-medium text-slate-400 mb-3">
          Block an IP Address
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            className="input"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="e.g. 192.168.1.1"
          />
          <button
            onClick={() => blockMutation.mutate(newIp)}
            disabled={!newIp || blockMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Block
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">Blocked At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  Loading IPs...
                </td>
              </tr>
            ) : ips.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No blocked IPs.
                </td>
              </tr>
            ) : (
              ips.map((ip: any) => (
                <tr
                  key={ip.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {ip.ip_address}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(ip.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => unblockMutation.mutate(ip.id)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                      title="Unblock"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
