// First-party, anonymous analytics: a per-tab random id, no cookies, no IP stored server-side.
const EVENTS_URL = `${process.env.NEXT_PUBLIC_API_URL}/events`;

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("gwam-sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("gwam-sid", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

// Real usernames/codes/tokens must not reach the analytics table.
function normalizePath(path: string): string {
  return path
    .replace(/^\/u\/[^/]+\/reply\/[^/]+/, "/u/[username]/reply/[token]")
    .replace(/^\/u\/[^/]+/, "/u/[username]")
    .replace(/^\/room\/[^/]+/, "/room/[code]");
}

export function track(name: string, path?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem("gwam-cookie-consent") === "declined") return;
  } catch {}
  fetch(EVENTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name,
      path: normalizePath(path ?? window.location.pathname),
      session: sessionId(),
    }),
    keepalive: true,
  }).catch(() => {});
}
