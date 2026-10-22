import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "Shop for Professionals",
  description:
    "Register a US beauty business, confirm your email, and shop replenishment products at your business price.",
  alternates: { canonical: "/for-professionals" },
};

export default function ForProfessionalsPage() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <PageIntro eyebrow="Shop" title="Order professional products for your business.">
          <p>
            Create a business account, confirm your email, and shop published replenishment products at your price.
            Programs and full salon systems stay consultative — they are not self-checkout SKUs.
          </p>
        </PageIntro>
        <ol className="mt-12 space-y-4 text-muted">
          <li>1. Register with your business details (or sign in if you already have an account).</li>
          <li>2. Confirm your email.</li>
          <li>3. Open Shop to see your prices, add products, and check out.</li>
          <li>4. Use Orders to track payment and fulfillment, and buy again at today&apos;s price.</li>
          <li>5. Joining an existing headquarters still requires an invitation — typing a company name does not link accounts.</li>
        </ol>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/partner/register" className="bg-charcoal px-6 py-3 text-sm text-cream">
            Create business account
          </Link>
          <Link href="/partner/login" className="border border-charcoal px-6 py-3 text-sm text-charcoal">
            Sign in
          </Link>
          <Link href="/professional-programs" className="text-sm underline-offset-4 hover:underline">
            Browse Programs
          </Link>
        </div>
      </div>
    </section>
  );
}
