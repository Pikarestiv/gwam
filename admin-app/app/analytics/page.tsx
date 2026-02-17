"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <BarChart3 className="text-blue-500" />
        Analytics
      </h1>

      {/* Embed Umami if available, or show stats charts */}
      <div className="card h-[600px] flex items-center justify-center text-slate-500 bg-slate-900 border-dashed border-2 border-slate-700">
        <p>Umami Analytics Dashboard Embed will go here</p>
      </div>
    </div>
  );
}
