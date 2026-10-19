import type { Metadata } from "next";
import { Faqs } from "@/components/Faqs";
import { Hero } from "@/components/Hero";
import { Metrics } from "@/components/Metrics";
import { Protocol } from "@/components/Protocol";
import { ProgramsOverview } from "@/components/programs/ProgramsOverview";
import { SolutionsOverview } from "@/components/SolutionsOverview";
import { System } from "@/components/System";
import { Trust } from "@/components/Trust";
import { WholesaleInvite } from "@/components/WholesaleInvite";
import { listPublishedProducts } from "@/lib/catalog";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dermabell Professional | Korean Skincare for Beauty Businesses",
  description:
    "Explore a complete salon implementation or log in to reorder authorized professional products. Operated in the U.S. by Axelerate Inc.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [products, session] = await Promise.all([listPublishedProducts(), getSession()]);

  return (
    <>
      <Hero />
      <SolutionsOverview products={products} session={session} />
      <ProgramsOverview />
      <Metrics />
      <System />
      <Protocol />
      <Trust />
      <WholesaleInvite />
      <Faqs />
    </>
  );
}
