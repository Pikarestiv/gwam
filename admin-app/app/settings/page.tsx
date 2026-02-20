"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminApi.getSettings().then((r) => r.data.data),
  });

  const toggleMaintenance = useMutation({
    mutationFn: (active: boolean) =>
      adminApi.updateSettings({ maintenance_mode: active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  const isMaintenanceActive = data?.maintenance_mode || false;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <Settings className="text-slate-400" />
        System Settings
      </h1>

      <div className="card max-w-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Maintenance Mode</h3>
        <p className="text-slate-400 text-sm mb-4">
          Enable maintenance mode to prevent non-admin users from accessing the
          platform. Active user sessions will be interrupted.
        </p>

        {isLoading ? (
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-12 h-6 rounded-full bg-slate-700"></div>
            <span className="text-slate-500">Loading state...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleMaintenance.mutate(!isMaintenanceActive)}
              disabled={toggleMaintenance.isPending}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                isMaintenanceActive ? "bg-red-500" : "bg-slate-700"
              } ${toggleMaintenance.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isMaintenanceActive ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={
                isMaintenanceActive
                  ? "text-red-400 font-bold"
                  : "text-slate-300"
              }
            >
              Maintenance Mode ({isMaintenanceActive ? "Enabled" : "Disabled"})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
