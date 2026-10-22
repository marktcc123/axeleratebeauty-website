import Image from "next/image";
import Link from "next/link";
import { BRAND_SERIES } from "@/data/brand-content";

/** Brand series from official public photography — not an auto-imported sellable catalog. */
export function BrandSeries() {
  return (
    <section className="border-t border-sand-200 bg-sand-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Collections</p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl text-ink sm:text-4xl">
          Professional lines you may know from Dermabell
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Photography from the official brand site for orientation. Only products in your authorized
          Shop are available to purchase in the U.S.
        </p>
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BRAND_SERIES.map((series) => (
            <li key={series.id}>
              <Link href={series.href} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream">
                  <Image
                    src={series.image}
                    alt={series.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <h3 className="mt-4 font-serif text-2xl text-ink">{series.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{series.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
