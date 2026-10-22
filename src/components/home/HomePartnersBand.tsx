import Link from "next/link";

export function HomePartnersBand() {
  return (
    <section className="border-t border-sand-200 bg-sand-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">U.S. partners</p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl text-ink sm:text-4xl">
          Real businesses already working with Dermabell
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          See how U.S. salons introduced professional Korean skincare — without invented rankings or
          unverified claims.
        </p>
        <Link
          href="/success-stories"
          className="mt-8 inline-block bg-charcoal px-6 py-3 text-sm text-cream"
        >
          View partner stories
        </Link>
      </div>
    </section>
  );
}
