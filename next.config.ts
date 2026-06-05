import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: '/qubestack-preview',
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: {
    position: 'top-left',
  },
};

export default nextConfig;
