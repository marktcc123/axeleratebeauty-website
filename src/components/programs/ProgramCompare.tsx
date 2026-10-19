import Link from "next/link";
import type { FacialProgram } from "@/data/facial-programs";
import { includedProductTypeCount, programHasBackbarAndRetail } from "@/lib/program-catalog";

export function ProgramCompare({ programs }: { programs: FacialProgram[] }) {
  return (
    <section className="mt-20">
      <h2 className="font-serif text-3xl text-ink sm:text-4xl">Compare programs</h2>
      <p className="mt-3 max-w-2xl text-muted">
        Compare intended cosmetic concerns, product families, and package structure.
        Professional pricing remains unpublished until separately approved.
      </p>

      <div className="mt-8 hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <caption className="sr-only">Comparison of Dermabell Professional Facial Programs</caption>
          <thead>
            <tr className="border-b border-sand-200">
              <th className="py-3 pr-4 font-medium text-muted"> </th>
              {programs.map((program) => (
                <th key={program.id} className="px-3 py-3 font-serif text-lg text-ink">
                  {program.customerFacingName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="align-top text-muted">
            <CompareRow label="Skin concern" values={programs.map((program) => program.concernLabel)} />
            <CompareRow label="Product family" values={programs.map((program) => program.productFamily)} />
            <CompareRow label="Treatment focus" values={programs.map((program) => program.treatmentFocus)} />
            <CompareRow label="Duration" values={programs.map((program) => program.duration)} />
            <CompareRow
              label="Included product types"
              values={programs.map((program) => String(includedProductTypeCount(program)))}
            />
            <CompareRow
              label="Backbar / retail support"
              values={programs.map((program) => {
                const support = programHasBackbarAndRetail(program);
                return [support.backbar ? "Professional backbar" : null, support.retail ? "Take-home support" : null]
                  .filter(Boolean)
                  .join(" · ");
              })}
            />
            <tr className="border-b border-sand-200">
              <th className="py-4 pr-4 font-medium text-stone-deep">Details</th>
              {programs.map((program) => (
                <td key={program.id} className="px-3 py-4">
                  <Link href={`/professional-programs/${program.slug}`} className="underline-offset-4 hover:underline">
                    View Program
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:hidden">
        {programs.map((program) => {
          const support = programHasBackbarAndRetail(program);
          return (
            <article key={program.id} className="border border-sand-200 bg-white p-5">
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: program.accent }}>
                {program.concernLabel}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-ink">{program.customerFacingName}</h3>
              <dl className="mt-4 space-y-2 text-sm text-muted">
                <div>
                  <dt className="text-stone-deep">Product family</dt>
                  <dd>{program.productFamily}</dd>
                </div>
                <div>
                  <dt className="text-stone-deep">Focus</dt>
                  <dd>{program.treatmentFocus}</dd>
                </div>
                <div>
                  <dt className="text-stone-deep">Duration</dt>
                  <dd>{program.duration}</dd>
                </div>
                <div>
                  <dt className="text-stone-deep">Included product types</dt>
                  <dd>{includedProductTypeCount(program)}</dd>
                </div>
                <div>
                  <dt className="text-stone-deep">Package support</dt>
                  <dd>
                    {support.backbar ? "Professional backbar" : ""}
                    {support.backbar && support.retail ? " · " : ""}
                    {support.retail ? "Take-home support" : ""}
                  </dd>
                </div>
              </dl>
              <Link href={`/professional-programs/${program.slug}`} className="mt-5 inline-block text-sm underline-offset-4 hover:underline">
                View Program
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b border-sand-200">
      <th className="py-4 pr-4 font-medium text-stone-deep">{label}</th>
      {values.map((value, index) => (
        <td key={`${label}-${index}`} className="px-3 py-4">
          {value}
        </td>
      ))}
    </tr>
  );
}
