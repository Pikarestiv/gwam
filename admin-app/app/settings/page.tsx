"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
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
          platform.
        </p>
        <div className="flex items-center gap-3">
          {/* Toggle placeholder */}
          <div className="w-12 h-6 rounded-full bg-slate-700 relative cursor-pointer opacity-50">
            <div className="w-4 h-4 rounded-full bg-white absolute left-1 top-1"></div>
          </div>
          <span className="text-slate-300">Maintenance Mode (Disabled)</span>
        </div>
      </div>
    </div>
  );
}
