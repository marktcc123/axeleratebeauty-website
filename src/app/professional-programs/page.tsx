import type { Metadata } from "next";
import Link from "next/link";
import { ProgramCompare } from "@/components/programs/ProgramCompare";
import { ProgramsExplorer } from "@/components/programs/ProgramsExplorer";
import { PageIntro } from "@/components/site/PageIntro";
import { PROFESSIONAL_PRICING_MESSAGE, listPublishedPrograms } from "@/lib/program-catalog";

export const metadata: Metadata = {
  title: "Professional Korean Facial Programs",
  description:
    "Explore four focused Korean facial programs for professional beauty businesses, with curated backbar products and structured service concepts.",
  alternates: { canonical: "/professional-programs" },
  openGraph: {
    title: "Professional Korean Facial Programs | Dermabell Professional",
    description:
      "Four targeted professional facial programs for salons and spas. Professional pricing available upon account approval.",
  },
};

export default function ProfessionalProgramsPage() {
  const programs = listPublishedPrograms();

  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <PageIntro
          eyebrow="Professional Programs"
          title="Professional Korean Facial Programs for Every Beauty Business."
        >
          <p>
            Explore four focused facial programs designed to help professional salons expand their
            treatment menus with curated Korean skincare products and structured service concepts.
          </p>
        </PageIntro>
        <p className="mt-6 text-sm text-muted">{PROFESSIONAL_PRICING_MESSAGE}</p>
        <div className="mt-10">
          <ProgramsExplorer programs={programs} />
        </div>
        <ProgramCompare programs={programs} />
        <div className="mt-20 border-t border-sand-200 pt-12">
          <h2 className="font-serif text-3xl text-ink">Next steps</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Shop published replenishment products after you create a business account and confirm
            your email. Full salon systems and training stay consultative — talk with our U.S. team.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/for-professionals" className="bg-charcoal px-6 py-3 text-sm text-cream">
              Shop Products
            </Link>
            <Link href="/store-evaluation" className="border border-charcoal px-6 py-3 text-sm text-charcoal">
              Request a consultation
            </Link>
            <Link href="/full-salon-system" className="text-sm text-muted underline-offset-4 hover:underline">
              Full Salon System
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
