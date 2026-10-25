"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { paymentsApi } from "@/lib/services";

// Paystack redirects back to /rooms/?reference=…; confirm it and open the new room.
export function PaymentReturn() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get(
      "reference",
    );
    if (!reference) return;
    setMessage("Confirming your payment…");
    paymentsApi
      .verify(reference)
      .then((res) => {
        const { status, room_code } = res.data.data;
        if (status === "paid" && room_code) router.replace(`/room/${room_code}`);
        else setMessage("Payment not confirmed yet. Refresh in a moment.");
      })
      .catch(() => setMessage("Couldn't confirm payment. Contact support."));
  }, [router]);

  if (!message) return null;
  return (
    <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
      {message}
    </p>
  );
}
