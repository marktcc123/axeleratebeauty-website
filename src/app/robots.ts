import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/partner/dashboard", "/partner/orders", "/partner/profile", "/cart", "/checkout"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
