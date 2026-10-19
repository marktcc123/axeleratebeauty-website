import Link from "next/link";
import { FadeIn } from "./FadeIn";

export function WholesaleInvite() {
  return (
    <section className="bg-sand-50 py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <FadeIn className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Wholesale Accounts</p>
          <h2 className="mt-4 font-serif text-3xl text-ink">Request professional access.</h2>
          <p className="mt-3 text-muted">
            Professional pricing is available upon account approval. Registration alone does not
            reveal confidential prices or unlock checkout.
          </p>
        </FadeIn>
        <Link href="/partner/register" className="bg-charcoal px-6 py-3 text-sm text-cream">
          Request Professional Access
        </Link>
      </div>
    </section>
  );
}
