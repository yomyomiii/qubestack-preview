import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: '/QubeStack-Coda',
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: {
    position: 'top-left',
  },
};

export default nextConfig;
