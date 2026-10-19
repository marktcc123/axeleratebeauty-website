import Link from "next/link";
import { FadeIn } from "./FadeIn";
import { Media } from "./Media";
import { ProductCard } from "./commerce/ProductCard";
import type { Product, SessionContext } from "@/lib/types";

export function SolutionsOverview({
  products,
  session,
}: {
  products: Product[];
  session: SessionContext;
}) {
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Solutions</p>
          <h2 className="mt-4 font-serif text-4xl text-ink sm:text-5xl">Two ways to work with Dermabell.</h2>
        </FadeIn>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <FadeIn className="border border-sand-200 bg-white p-8">
            <Media
              src="/images/training/train-01.webp"
              alt="On-site Dermabell salon implementation training"
              width={900}
              height={700}
              sizes="(max-width: 1024px) 100vw, 560px"
              className="aspect-[5/4] bg-sand-50"
              imgClassName="h-full w-full object-cover"
            />
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted">Full Salon System</p>
            <h3 className="mt-2 font-serif text-3xl text-ink">A complete salon service expansion.</h3>
            <p className="mt-3 text-muted">
              Professional equipment, consultation tools, protocols, training, and implementation
              support for businesses introducing or expanding facial services. This is a guided
              B2B engagement, not a standard add-to-cart product.
            </p>
            <Link href="/full-salon-system" className="mt-6 inline-block bg-charcoal px-5 py-3 text-sm text-cream">
              Explore the Full System
            </Link>
          </FadeIn>

          <FadeIn delay={0.08} className="border border-sand-200 bg-white p-8">
            <Media
              src="/images/family/system-02.webp"
              alt="Dermabell professional skincare lineup"
              width={900}
              height={700}
              sizes="(max-width: 1024px) 100vw, 560px"
              className="aspect-[5/4] bg-sand-50"
              imgClassName="h-full w-full object-contain"
            />
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted">Professional Facial Programs</p>
            <h3 className="mt-2 font-serif text-3xl text-ink">Four focused programs for existing treatment businesses.</h3>
            <p className="mt-3 text-muted">
              Start with a focused professional facial program, or explore a complete salon
              implementation solution. These programs do not include the Full Salon System&apos;s
              equipment, training, or implementation services.
            </p>
            <Link href="/professional-programs" className="mt-6 inline-block border border-charcoal px-5 py-3 text-sm">
              Explore Professional Programs
            </Link>
          </FadeIn>
        </div>

        <div className="mt-16">
          {products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} session={session} />
              ))}
            </div>
          ) : (
            <p className="max-w-2xl text-sm text-muted">
              Professional pricing stays unpublished until separately approved. Public visitors
              can review program contents without seeing confidential commercial terms.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
