import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@portscope/shared'],
  env: {
    DEMO_MODE: process.env.DEMO_MODE || process.env.NEXT_PUBLIC_DEMO_MODE || '',
  },
};

export default nextConfig;
