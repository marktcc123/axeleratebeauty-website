import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "For Professionals",
  description: "Register a beauty business, wait for approval, then view authorized professional pricing and reorder published products.",
  alternates: { canonical: "/for-professionals" },
};

export default function ForProfessionalsPage() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <PageIntro eyebrow="For Professionals" title="A professional purchasing path, not a consumer store.">
          <p>
            Dermabell Professional is for beauty businesses. Public pages explain programs and
            partnership. Authorized prices appear only after an administrator approves your
            account and assigns a store. Pending accounts cannot buy or see partner dollars.
          </p>
        </PageIntro>
        <ol className="mt-12 space-y-4 text-muted">
          <li>1. Review Professional Programs and Real Partners on the public site.</li>
          <li>2. Request access with a business account (or log in if you already registered).</li>
          <li>3. Wait for verification and store assignment.</li>
          <li>4. After approval, open Catalog to reorder at your store&apos;s price.</li>
          <li>5. Use Orders to track payment or refund status and buy again at today&apos;s price.</li>
        </ol>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/partner/register" className="bg-charcoal px-6 py-3 text-sm text-cream">Request Professional Access</Link>
          <Link href="/partner/login" className="border border-charcoal px-6 py-3 text-sm text-charcoal">Professional Login</Link>
          <Link href="/professional-programs" className="text-sm underline-offset-4 hover:underline">Browse Professional Programs</Link>
        </div>
      </div>
    </section>
  );
}
