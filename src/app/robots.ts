import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/partner/", "/cart", "/checkout", "/auth/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
