import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/qubestack-preview',
  images: { unoptimized: true },
  devIndicators: {
    position: 'top-left',
  },
};

export default nextConfig;
