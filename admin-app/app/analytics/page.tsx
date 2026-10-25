"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
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

function TrendChart({
  title,
  color,
  queryFn,
}: {
  title: string;
  color: string;
  queryFn: () => Promise<any>;
}) {
  const { data = [] } = useQuery({
    queryKey: ["analytics", title],
    queryFn: () => queryFn().then((r) => r.data.data),
  });

  return (
    <div className="card h-80">
      <h3 className="text-lg font-bold text-white mb-4">{title} (30 days)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
            itemStyle={{ color: "#f8fafc" }}
          />
          <Area type="monotone" dataKey="count" stroke={color} fill={color} fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopList({
  title,
  queryFn,
  label,
  count,
}: {
  title: string;
  queryFn: () => Promise<any>;
  label: (row: any) => string;
  count: (row: any) => number;
}) {
  const { data = [] } = useQuery({
    queryKey: ["analytics", title],
    queryFn: () => queryFn().then((r) => r.data.data),
  });

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <ol className="space-y-2">
        {data.map((row: any, i: number) => (
          <li key={i} className="flex justify-between text-sm text-slate-300">
            <span>
              {i + 1}. {label(row)}
            </span>
            <span className="text-white font-semibold">{count(row)}</span>
          </li>
        ))}
        {data.length === 0 && <li className="text-sm text-slate-500">No data yet.</li>}
      </ol>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <BarChart3 className="text-blue-500" />
        Analytics
      </h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart title="Messages" color="#3b82f6" queryFn={adminApi.getMessagesChart} />
        <TrendChart title="Signups" color="#22c55e" queryFn={adminApi.getSignupsChart} />
        <TopList
          title="Top Recipients"
          queryFn={adminApi.getTopRecipients}
          label={(r) => `@${r.recipient?.username ?? "deleted"}`}
          count={(r) => r.count}
        />
        <TopList
          title="Top Rooms"
          queryFn={adminApi.getTopRooms}
          label={(r) => r.name || r.code}
          count={(r) => r.messages_count}
        />
      </div>
    </div>
  );
}
