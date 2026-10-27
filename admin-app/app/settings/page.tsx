"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  AlertTriangle,
  Megaphone,
  Server,
  Zap,
  CreditCard,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { adminApi } from "@/lib/api";

export default function SettingsPage() {
  const qc = useQueryClient();
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [cacheMsg, setCacheMsg] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminApi.getSettings().then((r) => r.data.data),
  });

  useEffect(() => {
    if (data?.announcement?.content) {
      setAnnouncementText(data.announcement.content);
    }
  }, [data]);

  const toggleMaintenance = useMutation({
    mutationFn: (active: boolean) =>
      adminApi.updateSettings({ maintenance_mode: active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  const saveAnnouncement = useMutation({
    mutationFn: (clear: boolean) =>
      adminApi.updateSettings(
        clear ? { clear_announcement: true } : { announcement: announcementText },
      ),
    onSuccess: (_, clear) => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      if (clear) {
        setAnnouncementText("");
        setAnnouncementMsg("Announcement cleared.");
      } else {
        setAnnouncementMsg("Announcement broadcasted successfully.");
      }
      setTimeout(() => setAnnouncementMsg(""), 4000);
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: () => adminApi.updateSettings({ clear_cache: true }),
    onSuccess: () => {
      setCacheMsg("Application cache cleared successfully.");
      setTimeout(() => setCacheMsg(""), 4000);
    },
  });

  const isMaintenanceActive = data?.maintenance_mode || false;
  const currentAnnouncement = data?.announcement;
  const system = data?.system || {};
  const roomPrices = system.room_prices || {};

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="text-slate-400" />
          System & Platform Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage system maintenance, broadcast announcements, integrations, and runtime diagnostics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Mode */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <AlertTriangle
              size={20}
              className={isMaintenanceActive ? "text-red-500" : "text-slate-400"}
            />
            Maintenance Mode
          </div>
          <p className="text-slate-400 text-sm">
            Enable maintenance mode to prevent non-admin visitors from using Gwa'm.
            Active user sessions receive a 503 maintenance screen; admin panel routes remain accessible.
          </p>

          {isLoading ? (
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-12 h-6 rounded-full bg-slate-700"></div>
              <span className="text-slate-500">Loading state...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 pt-2">
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
                className={`text-sm font-semibold ${
                  isMaintenanceActive ? "text-red-400" : "text-slate-300"
                }`}
              >
                {isMaintenanceActive ? "Maintenance Mode Active" : "Normal Operation (Live)"}
              </span>
            </div>
          )}
        </div>

        {/* Global Broadcast Announcement */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Megaphone size={20} className="text-purple-400" />
            Global Broadcast Announcement
          </div>
          <p className="text-slate-400 text-sm">
            Publish an active banner displayed across user dashboards.
          </p>

          {currentAnnouncement && (
            <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-lg text-xs space-y-1">
              <div className="text-purple-300 font-semibold flex items-center gap-1.5">
                <CheckCircle size={14} /> Currently Broadcasting:
              </div>
              <p className="text-slate-200 italic">"{currentAnnouncement.content}"</p>
            </div>
          )}

          <div className="space-y-2">
            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Scheduled maintenance this Sunday at 2 AM UTC."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {announcementMsg && (
              <p className="text-xs text-green-400 font-medium">{announcementMsg}</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => saveAnnouncement.mutate(false)}
                disabled={saveAnnouncement.isPending || !announcementText.trim()}
                className="btn-primary text-xs py-2 px-4 disabled:opacity-40"
              >
                {saveAnnouncement.isPending ? "Broadcasting…" : "Broadcast Announcement"}
              </button>
              {currentAnnouncement && (
                <button
                  onClick={() => saveAnnouncement.mutate(true)}
                  disabled={saveAnnouncement.isPending}
                  className="btn-secondary text-xs py-2 px-4 text-red-400 hover:text-red-300"
                >
                  Clear Active Banner
                </button>
              )}
            </div>
          </div>
        </div>

        {/* System & Runtime Environment */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Server size={20} className="text-blue-400" />
            Environment & System Diagnostics
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Environment</span>
              <span className="text-white font-mono uppercase bg-slate-800 px-2 py-0.5 rounded">
                {system.environment || "production"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">PHP Version</span>
              <span className="text-white font-mono">{system.php_version || "8.1+"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Laravel Version</span>
              <span className="text-white font-mono">{system.laravel_version || "10.x"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Frontend App URL</span>
              <span className="text-blue-400 font-mono truncate max-w-xs">{system.app_url}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">API Gateway URL</span>
              <span className="text-purple-400 font-mono truncate max-w-xs">{system.api_url}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => clearCacheMutation.mutate()}
              disabled={clearCacheMutation.isPending}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-2 w-full justify-center"
            >
              <RefreshCw
                size={14}
                className={clearCacheMutation.isPending ? "animate-spin" : ""}
              />
              Clear Backend Framework Cache
            </button>
            {cacheMsg && (
              <p className="text-xs text-green-400 text-center mt-2 font-medium">
                {cacheMsg}
              </p>
            )}
          </div>
        </div>

        {/* Integrations & Monetization */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Zap size={20} className="text-amber-400" />
            Integrations & Pricing Tiers
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Zap size={16} className="text-purple-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Web Push (VAPID)</p>
                  <p className="text-[11px] text-slate-400">Browser background push ping</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  system.vapid_configured
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {system.vapid_configured ? "Configured" : "Missing Keys"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2.5">
                <CreditCard size={16} className="text-blue-400" />
                <div>
                  <p className="text-xs font-semibold text-white">Paystack Payment Gateway</p>
                  <p className="text-[11px] text-slate-400">Paid room duration checkout</p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  system.paystack_configured
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {system.paystack_configured ? "Active" : "Key Not Set"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" /> Room Duration Pricing Tiers:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-[10px]">3 Days (72h)</p>
                <p className="text-white font-bold mt-0.5">
                  ₦{((roomPrices[72] || 50000) / 100).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-[10px]">7 Days (168h)</p>
                <p className="text-white font-bold mt-0.5">
                  ₦{((roomPrices[168] || 100000) / 100).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-[10px]">30 Days (720h)</p>
                <p className="text-white font-bold mt-0.5">
                  ₦{((roomPrices[720] || 300000) / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
