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
          <h2 className="font-serif text-3xl text-ink">Apply for professional access</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Registration lets beauty professionals request account review. It does not reveal
            confidential prices or unlock checkout.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/partner/register" className="bg-charcoal px-6 py-3 text-sm text-cream">
              Apply for Professional Access
            </Link>
            <Link href="/contact" className="text-sm underline-offset-4 hover:underline">
              Talk to Our Team
            </Link>
            <Link href="/full-salon-system" className="text-sm text-muted underline-offset-4 hover:underline">
              Explore the Full Salon System
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
