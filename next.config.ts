import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "pdfjs-dist",
    "firebase-admin",
    "google-gax",
    "@grpc/grpc-js",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
