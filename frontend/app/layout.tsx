import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "Gwam 👻 — Anonymous Messaging", template: "%s | Gwam" },
  description:
    "Gwam anything. No names, no judgment. Send and receive anonymous messages.",
  keywords: ["anonymous messaging", "gwam", "ngl", "anonymous", "dumostech"],
  authors: [{ name: "Dumostech", url: "https://dumostech.com" }],
  creator: "Dumostech",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://app.gwam.dumostech.com",
  ),
  openGraph: {
    type: "website",
    siteName: "Gwam",
    title: "Gwam 👻 — Anonymous Messaging",
    description: "Gwam anything. No names, no judgment.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gwam 👻 — Anonymous Messaging",
    description: "Gwam anything. No names, no judgment.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gwam",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <html lang="en" data-theme="gwam_dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {umamiScriptUrl && umamiWebsiteId && (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
