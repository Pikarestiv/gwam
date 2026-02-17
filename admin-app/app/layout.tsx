"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AdminShell>{children}</AdminShell>
        </QueryClientProvider>
      </body>
    </html>
  );
}
