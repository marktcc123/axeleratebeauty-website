import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { BrandSeries } from "@/components/home/BrandSeries";
import { HomeAboutBand } from "@/components/home/HomeAboutBand";
import { HomePartnersBand } from "@/components/home/HomePartnersBand";
import { HomeProgramsBand } from "@/components/home/HomeProgramsBand";
import { HomeShopPreview } from "@/components/home/HomeShopPreview";
import { CatalogError, listPublishedProducts } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dermabell Professional | Korean Skincare for Beauty Businesses",
  description:
    "Shop professional Dermabell products for U.S. beauty businesses, or explore training and salon implementation with Axelerate Inc.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const session = await getSession();
  let products: Product[] = [];
  try {
    products = await listPublishedProducts();
  } catch (error) {
    if (!(error instanceof CatalogError)) throw error;
  }

  return (
    <>
      <Hero />
      <HomeShopPreview products={products} session={session} />
      <BrandSeries />
      <HomeProgramsBand />
      <HomePartnersBand />
      <HomeAboutBand />
    </>
  );
}
