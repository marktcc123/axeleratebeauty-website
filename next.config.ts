import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Public listing of kits maps to programs marketing. Keep SKU detail routes on /professional-kits/[slug]
      // and partner purchase detail on /partner/catalog/[slug] — do not redirect slug URLs to programs.
      { source: "/professional-kits", destination: "/professional-programs", permanent: false },
      { source: "/case-studies", destination: "/success-stories", permanent: false },
    ];
  },
};

export default nextConfig;
