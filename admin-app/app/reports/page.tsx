"use client";

// Placeholder for Reports page - similar structure to Flagged Messages but for reports
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <AlertTriangle className="text-orange-500" />
        Reports
      </h1>
      <p className="text-slate-400">
        Reports queue implementation pending backend integration.
      </p>
    </div>
  );
}
