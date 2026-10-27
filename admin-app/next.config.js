/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/admin",
  images: {
    unoptimized: true, // Required for static export
    domains: ["api.dicebear.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://gwam-api.dumostech.com/api/v1",
  },
};

module.exports = nextConfig;
