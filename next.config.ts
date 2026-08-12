import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      // Firebase Storage emulator (local development only, see .env.example).
      { protocol: "http", hostname: "127.0.0.1", port: "9199" },
      { protocol: "http", hostname: "localhost", port: "9199" },
    ],
    // Only takes effect for the loopback patterns above, which are limited to
    // local emulator development; production always serves images from the
    // real firebasestorage.googleapis.com host over HTTPS.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
