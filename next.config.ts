import type { NextConfig } from "next";
import { OPTIMIZED_IMAGE_HOSTS } from "./src/core/lib/image-hosts";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    // Admin video uploads are proxied through Next route handlers.
    // Keep this above the backend per-file cap (200MB) so Next does not 413 first.
    proxyClientMaxBodySize: 220 * 1024 * 1024,
  },
  images: {
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

export default nextConfig;
