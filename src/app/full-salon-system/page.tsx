import type { Metadata } from "next";
import Link from "next/link";
import { Metrics } from "@/components/Metrics";
import { Protocol } from "@/components/Protocol";
import { System } from "@/components/System";
import { Trust } from "@/components/Trust";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "Full Salon System | Dermabell Professional",
  description:
    "A complete salon implementation solution for beauty businesses adding Korean facial services. Book a store consultation — this is not a standard checkout item.",
  alternates: { canonical: "/full-salon-system" },
};

export default function FullSalonSystemPage() {
  return (
    <>
      <section className="bg-atmosphere px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <PageIntro eyebrow="Full Salon System" title="A complete salon service expansion solution.">
            <p>
              The Full Salon System is a consultative implementation for beauty businesses
              adding or expanding Korean facial services. It is sold through conversation,
              evaluation, and a commercial proposal — not as a standard checkout item.
            </p>
          </PageIntro>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/store-evaluation" className="bg-charcoal px-6 py-3 text-sm text-cream">
              Book a Store Consultation
            </Link>
            <Link href="/success-stories" className="text-sm underline-offset-4 hover:underline">
              Watch a Real U.S. Implementation
            </Link>
            <Link href="/contact" className="text-sm underline-offset-4 hover:underline">
              Request a Proposal
            </Link>
          </div>
        </div>
      </section>
      <Metrics />
      <System />
      <Protocol />
      <Trust />
    </>
  );
}
