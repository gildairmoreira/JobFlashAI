import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "w0mlmrgwbziwquaq.public.blob.vercel-storage.com"
      },
      {
        protocol: "https",
        hostname: "z8vmmgdozwxyisuc.public.blob.vercel-storage.com"
      }
    ]
  }
};

export default nextConfig;
