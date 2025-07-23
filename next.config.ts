import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    // Enable unoptimized images as a fallback for any domain issues
    unoptimized: true,
  },
};

export default nextConfig;
