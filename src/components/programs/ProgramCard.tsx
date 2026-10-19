import Link from "next/link";
import { Media } from "@/components/Media";
import type { FacialProgram } from "@/data/facial-programs";

export function ProgramCard({
  program,
  featured = false,
}: {
  program: FacialProgram;
  featured?: boolean;
}) {
  return (
    <article className="flex h-full flex-col border border-sand-200 bg-white">
      <Link href={`/professional-programs/${program.slug}`} className="block" style={{ backgroundColor: program.accentSoft }}>
        <Media
          src={program.heroImage}
          alt={`${program.customerFacingName} professional product photography`}
          width={900}
          height={720}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 360px"
          className={featured ? "aspect-[5/4]" : "aspect-square"}
          imgClassName="h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: program.accent }}>
          {program.concernLabel}
        </p>
        <h3 className="mt-2 font-serif text-2xl text-ink">
          <Link href={`/professional-programs/${program.slug}`}>{program.customerFacingName}</Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{program.shortPositioning}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted">{program.duration}</p>
        <Link
          href={`/professional-programs/${program.slug}`}
          className="mt-auto pt-5 text-sm underline-offset-4 hover:underline"
        >
          View Program
        </Link>
      </div>
    </article>
  );
}
