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
