import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Allow Swiper CSS imports
  transpilePackages: ['swiper'],
};

export default nextConfig;
