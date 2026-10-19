import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/professional-kits", destination: "/professional-programs", permanent: false },
      { source: "/professional-kits/:slug", destination: "/professional-programs/:slug", permanent: false },
      { source: "/case-studies", destination: "/success-stories", permanent: false },
    ];
  },
};

export default nextConfig;
