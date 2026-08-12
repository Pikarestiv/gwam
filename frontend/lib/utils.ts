import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function formatExpiryCountdown(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Expired";

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Expires in ${days}d`;
  if (hours > 0) return `Expires in ${hours}h`;
  return `Expires in ${minutes}m`;
}

export function generateGhostAlias(): string {
  const adjectives = [
    "Pepper",
    "Mode",
    "Writer",
    "Rider",
    "Chaser",
    "Buster",
    "Hunter",
    "Whisperer",
    "Dancer",
    "Surfer",
  ];
  const emojis = ["🌶", "🕶", "✍️", "🏍", "💨", "👻", "🔍", "🤫", "💃", "🏄"];
  const idx = Math.floor(Math.random() * adjectives.length);
  return `Ghost ${adjectives[idx]} ${emojis[idx]}`;
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}
