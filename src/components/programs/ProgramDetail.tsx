import Link from "next/link";
import { Media } from "@/components/Media";
import type { FacialProgram } from "@/data/facial-programs";
import {
  PROFESSIONAL_PRICING_MESSAGE,
  formatLineItem,
  itemsByRole,
} from "@/lib/program-catalog";

const workflow = [
  "Consultation",
  "Preparation / Cleansing",
  "Professional Skincare Application",
  "Mask or Finishing Step",
  "Aftercare Recommendation",
];

export function ProgramDetail({ program }: { program: FacialProgram }) {
  const backbar = itemsByRole(program, "backbar");
  const retail = itemsByRole(program, "retail");

  return (
    <article>
      <section className="px-5 py-20 sm:px-8 sm:py-28" style={{ backgroundColor: program.accentSoft }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: program.accent }}>
              {program.concernLabel}
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-ink text-balance sm:text-5xl">
              {program.customerFacingName}
            </h1>
            {program.officialName !== program.customerFacingName && (
              <p className="mt-2 text-sm text-muted">Official name: {program.officialName}</p>
            )}
            <p className="mt-5 text-lg leading-relaxed text-stone-deep">{program.editorial}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {program.concerns.map((concern) => (
                <li key={concern} className="border border-sand-200 bg-white/70 px-3 py-1 text-xs text-stone-deep">
                  {concern}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm uppercase tracking-[0.16em] text-muted">Professional use only · {program.duration}</p>
            <p className="mt-3 text-sm text-muted">{PROFESSIONAL_PRICING_MESSAGE}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/partner/register" className="bg-charcoal px-6 py-3 text-sm text-cream">
                Request Professional Access
              </Link>
              <a href="#whats-included" className="text-sm underline-offset-4 hover:underline">
                View What&apos;s Included
              </a>
            </div>
          </div>
          <Media
            src={program.heroImage}
            alt={`${program.customerFacingName} product photography`}
            width={1100}
            height={900}
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="bg-white"
            imgClassName="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-cream px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-ink">Who this program is for</h2>
            <p className="mt-4 text-muted">
              This program is intended for licensed professionals where required, and for established
              beauty businesses adding a focused Korean facial service. It does not include the
              equipment, implementation, or full support of the Full Salon System.
            </p>
            <ul className="mt-5 space-y-2 text-muted">
              {program.audience.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-ink">Skin concern and service concept</h2>
            <p className="mt-4 text-muted">
              {program.editorial} The source materials describe an approximately 30–40-minute
              nonmedical facial format. Final chair-side sequencing should follow an approved protocol.
            </p>
            <p className="mt-4 text-sm text-muted">Product family: {program.productFamily}</p>
          </div>
        </div>
      </section>

      <section className="bg-sand-50 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl text-ink">Formula and product system</h2>
          <p className="mt-4 max-w-2xl text-muted">
            The program is built around the {program.productFamily} family. Technical ingredient
            concentrations remain unpublished until regulatory review is complete.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {backbar.slice(0, 3).map((item) => (
              <div key={item.product.id} className="border border-sand-200 bg-white p-4">
                {item.product.image && (
                  <Media
                    src={item.product.image}
                    alt={item.product.name}
                    width={640}
                    height={640}
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="aspect-square bg-sand-50"
                    imgClassName="h-full w-full object-cover"
                  />
                )}
                <p className="mt-4 font-serif text-xl text-ink">{item.product.name}</p>
                <p className="mt-1 text-sm text-muted">{item.product.size}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="whats-included" className="bg-cream px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl text-ink">What&apos;s included</h2>
          <p className="mt-4 max-w-2xl text-muted">
            Package contents match the approved source catalog. Official manufacturer SKUs and
            prices are not published here.
          </p>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <ContentsList title="Professional Backbar" items={backbar} accent={program.accent} />
            <ContentsList title="Take-Home / Retail Support" items={retail} accent={program.accent} />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl text-ink">Professional service experience</h2>
          <p className="mt-4 max-w-2xl text-muted">
            A conceptual overview for salon planning. This is not a newly invented official treatment SOP.
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {workflow.map((step, index) => (
              <li key={step} className="border-t border-sand-200 pt-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-serif text-xl text-ink">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-sand-50 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl text-ink">Training and support</h2>
            <p className="mt-4 text-muted">{program.trainingNote}</p>
            <p className="mt-4 text-sm text-muted">
              Training format, duration, certification, and included support must be confirmed
              before any specific commitment is published.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-ink">Program questions</h2>
            <dl className="mt-6 space-y-5">
              {[
                ["Is this suitable for my type of salon?", "It is intended for professional beauty businesses adding a focused Korean facial service. Licensing requirements vary by state and role."],
                ["Do I need special equipment?", "This package specification does not include machines or analyzers. Equipment belongs to the separate Full Salon System conversation."],
                ["What comes with the package?", "The exact backbar and take-home items listed above, with pack counts preserved from the source catalog."],
                ["Are products available for replenishment?", "Replenishment SKUs can be enabled later for approved accounts after publication and pricing approval."],
                ["How does professional training work?", program.trainingNote],
                ["Can approved businesses purchase online?", "Not until a final price, inventory, shipping, and checkout configuration are approved. Request professional access to be notified."],
              ].map(([q, a]) => (
                <div key={q}>
                  <dt className="font-serif text-xl text-ink">{q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-cream px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl text-ink">Bring This Professional Facial Program to Your Salon.</h2>
          <p className="mt-4 text-muted">{PROFESSIONAL_PRICING_MESSAGE}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/partner/register" className="bg-charcoal px-6 py-3 text-sm text-cream">
              Request Professional Access
            </Link>
            <Link href="/contact" className="text-sm underline-offset-4 hover:underline">
              Contact Dermabell
            </Link>
          </div>
          <Link href="/full-salon-system" className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:underline">
            Looking for a complete salon implementation? Explore the Full Salon System.
          </Link>
        </div>
      </section>
    </article>
  );
}

function ContentsList({
  title,
  items,
  accent,
}: {
  title: string;
  items: ReturnType<typeof itemsByRole>;
  accent: string;
}) {
  return (
    <div>
      <h3 className="font-serif text-2xl text-ink">{title}</h3>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={`${item.product.id}-${item.role}`} className="flex gap-4 border-b border-sand-200 pb-4">
            {item.product.image && (
              <Media
                src={item.product.image}
                alt={item.product.name}
                width={120}
                height={120}
                sizes="96px"
                className="h-20 w-20 shrink-0 bg-sand-50"
                imgClassName="h-full w-full object-cover"
              />
            )}
            <div>
              <p className="text-stone-deep">{formatLineItem(item)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em]" style={{ color: accent }}>
                {item.product.family ?? "Professional catalog"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
