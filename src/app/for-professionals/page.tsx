import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";

export default function ForProfessionalsPage() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <PageIntro eyebrow="For Professionals" title="A professional purchasing path, not a consumer store.">
          <p>
            Dermabell Professional is designed for beauty businesses. After you register,
            an administrator reviews the account. Approved buyers may later view authorized
            prices and purchase published programs. Pending accounts cannot bypass verification,
            and no prices are shown until separately approved.
          </p>
        </PageIntro>
        <ol className="mt-12 space-y-4 text-muted">
          <li>1. Discover the four Professional Facial Programs.</li>
          <li>2. Request professional access with a business account.</li>
          <li>3. Submit business verification details.</li>
          <li>4. Wait for approval.</li>
          <li>5. View authorized prices only after they are separately approved.</li>
        </ol>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/partner/register" className="bg-charcoal px-6 py-3 text-sm text-cream">Request Professional Access</Link>
          <Link href="/professional-programs" className="text-sm underline-offset-4 hover:underline">Browse Professional Programs</Link>
        </div>
      </div>
    </section>
  );
}
