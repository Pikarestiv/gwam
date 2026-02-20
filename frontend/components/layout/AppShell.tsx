"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Users,
  Share2,
  Bell,
  User,
  MessageSquare,
  Home,
  Settings,
  Shield,
} from "lucide-react";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { GhostSVG } from "@/components/ui/GhostSVG";
import { PWAInstallBanner } from "@/components/ui/PWAInstallBanner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/rooms", icon: Users, label: "Rooms" },
  { href: "/share", icon: Share2, label: "Share" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/profile", icon: User, label: "Profile" },
];

// ─── Bottom Nav (Mobile) ───────────────────────────────────────────────────
export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bottom-nav"
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          const isNotif = href === "/notifications";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive ? "text-primary" : "text-muted",
              )}
              style={
                isActive
                  ? { color: "var(--color-primary)" }
                  : { color: "var(--color-muted)" }
              }
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {isNotif && unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "var(--color-primary)" }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Sidebar (Desktop) ─────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  const sidebarItems = [
    ...navItems,
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r px-4 py-6"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8 px-2">
        <GhostSVG size={32} />
        <span
          className="text-xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          Gwam
        </span>
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {sidebarItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          const isNotif = href === "/notifications";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium",
                isActive ? "text-white" : "hover:bg-surface-2",
              )}
              style={
                isActive
                  ? { background: "var(--color-primary)", color: "white" }
                  : { color: "var(--color-muted)" }
              }
            >
              <div className="relative">
                <Icon size={20} />
                {isNotif && unreadCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{
                      background: isActive ? "white" : "var(--color-primary)",
                      color: isActive ? "var(--color-primary)" : "white",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User avatar at bottom */}
      {user && (
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl mt-4 transition-all"
          style={{ color: "var(--color-muted)" }}
        >
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatar_seed || user.username}`}
            alt={user.name}
            className="w-8 h-8 rounded-full"
            style={{ background: "var(--color-surface-2)" }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--color-text)" }}
            >
              {user.name}
            </p>
            <p className="text-xs truncate">@{user.username}</p>
          </div>
        </Link>
      )}
    </aside>
  );
}

// ─── Top Bar (Mobile) ──────────────────────────────────────────────────────
export function TopBar({ title }: { title?: string }) {
  return (
    <header
      className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 py-3"
      style={{
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Link href="/" className="flex items-center gap-2">
        <GhostSVG size={24} />
        <span
          className="font-bold text-lg"
          style={{ color: "var(--color-primary)" }}
        >
          {title || "Gwam"}
        </span>
      </Link>
      <Link href="/settings" style={{ color: "var(--color-muted)" }}>
        <Settings size={20} />
      </Link>
    </header>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────
export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar title={title} />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
      </div>
      <BottomNav />
      <PWAInstallBanner />
    </div>
  );
}
