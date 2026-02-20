"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/stores/adminStore";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Ghost,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Reports", href: "/reports", icon: AlertTriangle },
  { label: "Blocked IPs", href: "/blocked-ips", icon: ShieldAlert },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAdminStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Normalize: strip trailing slash for comparison (trailingSlash: true adds it)
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  const isLoginPage = cleanPath === "/login";

  useEffect(() => {
    if (isMounted && !isAuthenticated && !isLoginPage) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, isLoginPage, router]);

  if (!isMounted) return null; // Prevent SSR flash
  if (!isAuthenticated && !isLoginPage) return null;

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 md:translate-x-0 md:static",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <Ghost className="text-blue-500" size={24} />
          <span className="font-bold text-lg text-white">Gwam Admin</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white",
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-slate-900 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-slate-950 border-b border-slate-800">
          <span className="font-bold text-white">Gwam Admin</span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-400"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
