import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { listPublishedPrograms } from "@/lib/program-catalog";

export function ProgramsOverview() {
  const programs = listPublishedPrograms();

  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Professional Programs</p>
          <h2 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">
            Four Professional Programs. Four Distinct Skin Concerns.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Discover targeted Korean facial programs designed for professional beauty businesses,
            each combining curated backbar products with a standardized approach to skincare services.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/professional-programs" className="inline-flex bg-charcoal px-6 py-3 text-sm text-cream">
            Explore Professional Programs
          </Link>
          <Link href="/full-salon-system" className="text-sm text-muted underline-offset-4 hover:underline">
            Looking for a complete salon implementation? Explore the Full Salon System.
          </Link>
        </div>
      </div>
    </section>
  );
}
