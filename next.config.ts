import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true  // This will ignore ESLint errors during builds
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'dk944imin',
  }
};

export default nextConfig;
