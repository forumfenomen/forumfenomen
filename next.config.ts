import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kdpevsewcjudzlxyrkiw.supabase.co",
        pathname:
          "/storage/v1/object/public/blog-images/**",
      },
    ],
  },
};

export default nextConfig;