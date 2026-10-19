import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";

export default function CheckoutCancelPage() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-xl">
        <PageIntro eyebrow="Checkout" title="Checkout was cancelled.">
          <p>No payment was collected. You can review the cart and try again when ready.</p>
        </PageIntro>
        <Link href="/cart" className="mt-8 inline-block bg-charcoal px-5 py-3 text-sm text-cream">Return to cart</Link>
      </div>
    </section>
  );
}
