"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  Users,
  MessageSquare,
  Home,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <Icon size={18} className={color} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  });

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-400">Loading stats...</div>
    );

  const stats = data || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.users?.total ?? 0}
          icon={Users}
          color="text-blue-500"
        />
        <StatsCard
          title="Total Messages"
          value={stats.messages?.all_time ?? 0}
          icon={MessageSquare}
          color="text-purple-500"
        />
        <StatsCard
          title="Active Rooms"
          value={stats.rooms?.active ?? 0}
          icon={Home}
          color="text-green-500"
        />
        <StatsCard
          title="Blocked IPs"
          value={stats.blocked_ips ?? 0}
          icon={ShieldAlert}
          color="text-red-500"
        />
      </div>

      {/* Chart */}
      <div className="card h-96">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" /> Message Volume
          (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.messages_chart}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                borderColor: "#334155",
                color: "#f8fafc",
              }}
              itemStyle={{ color: "#f8fafc" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
