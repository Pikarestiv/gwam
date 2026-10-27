"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { pushApi } from "@/lib/services";
import { track } from "@/lib/track";

function keyToBytes(base64Url: string): Uint8Array {
  const pad = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const raw = atob((base64Url + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator && "PushManager" in window)) return;
    setSupported(true);
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => {});
  }, []);

  if (!supported) return null;

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await pushApi.unsubscribe(existing.endpoint);
        await existing.unsubscribe();
        setEnabled(false);
      } else {
        if ((await Notification.requestPermission()) !== "granted") {
          setError("Notifications are blocked in your browser settings.");
          return;
        }
        const { public_key } = (await pushApi.key()).data.data;
        if (!public_key) {
          setError("Notifications aren't available right now.");
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyToBytes(public_key).buffer as ArrayBuffer,
        });
        await pushApi.subscribe(sub.toJSON());
        track("push_enabled");
        setEnabled(true);
      }
    } catch {
      setError("Couldn't update notifications. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bell size={18} style={{ color: "var(--color-primary)" }} />
          <div>
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
              Push notifications
            </p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Get pinged when someone sends you a Gwa'm.
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{
            background: enabled
              ? "var(--color-surface-2)"
              : "var(--color-primary)",
            color: enabled ? "var(--color-text)" : "white",
          }}
        >
          {enabled ? "Turn off" : "Turn on"}
        </button>
      </div>
      {error && (
        <p className="text-xs mt-2" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
