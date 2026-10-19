import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { listPublishedPrograms } from "@/lib/program-catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const staticRoutes = [
    "",
    "/full-salon-system",
    "/professional-programs",
    "/success-stories",
    "/for-professionals",
    "/contact",
    "/store-evaluation",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...listPublishedPrograms().map((program) => ({
      url: `${base}/professional-programs/${program.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
