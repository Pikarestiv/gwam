/** @type {import('next').NextConfig} */
let withPWA;
try {
  withPWA = require("next-pwa")({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    runtimeCaching: [],
  });
} catch {
  // next-pwa not installed yet — skip PWA wrapping
  withPWA = (config) => config;
}

const nextConfig = {
  // Static export for Namecheap shared hosting
  // Dynamic routes (/u/[username], /room/[code]) are handled client-side
  // .htaccess rewrites all requests to index.html for SPA routing
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["api.dicebear.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://api.gwam.dumostech.com/api/v1",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://app.gwam.dumostech.com",
  },
  // Suppress the generateStaticParams warning for dynamic routes
  // These pages are rendered client-side via useParams()
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = withPWA(nextConfig);
