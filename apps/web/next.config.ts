import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@junielyfe/ui', '@junielyfe/core', '@junielyfe/db'],
};

export default nextConfig;
