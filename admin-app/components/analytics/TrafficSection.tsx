"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminApi } from "@/lib/api";

export function TrafficSection() {
  const [days, setDays] = useState(30);
  const { data } = useQuery({
    queryKey: ["analytics-traffic", days],
    queryFn: () => adminApi.getAnalytics(days).then((r) => r.data.data),
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Traffic{" "}
          <span className="text-sm font-normal text-slate-400">
            {data?.visitors ?? 0} visitors
          </span>
        </h2>
        <select
          className="bg-slate-800 text-slate-200 rounded-lg px-3 py-1.5 text-sm"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {[7, 30, 90].map((d) => (
            <option key={d} value={d}>
              Last {d} days
            </option>
          ))}
        </select>
      </div>

      <div className="card h-80">
        <h3 className="text-lg font-bold text-white mb-4">Page views</h3>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={data?.daily ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
              itemStyle={{ color: "#f8fafc" }}
            />
            <Area type="monotone" dataKey="views" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
            <Area type="monotone" dataKey="visitors" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Table title="Top pages" rows={data?.top_paths ?? []} label="path" />
        <Table title="Events" rows={data?.events ?? []} label="name" />
      </div>
    </section>
  );
}

function Table({ title, rows, label }: { title: string; rows: any[]; label: string }) {
  return (
    <div className="card">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r[label]} className="flex justify-between text-sm text-slate-300">
            <span className="truncate">{r[label]}</span>
            <span className="text-white font-semibold">{r.count}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-slate-500">No data yet.</li>}
      </ul>
    </div>
  );
}
