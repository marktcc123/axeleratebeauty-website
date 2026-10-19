import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageIntro } from "@/components/site/PageIntro";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Store Evaluation",
  description: "Request a working consultation for the Dermabell Full Salon System. This is a guided B2B evaluation, not an online checkout.",
  alternates: { canonical: "/store-evaluation" },
};

export default async function StoreEvaluationPage() {
  const session = await getSession();
  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-xl">
        <PageIntro eyebrow="Store Evaluation" title="Book a working consultation.">
          <p>
            Give us 30 minutes — a session where we walk through the Full Salon System,
            answer questions, and model your shop&apos;s unit economics with you.
          </p>
        </PageIntro>
        <InquiryForm
          source="store_evaluation"
          defaultName={session.fullName ?? undefined}
          defaultEmail={session.email ?? undefined}
          defaultBusiness={session.organizationName ?? undefined}
        />
      </div>
    </section>
  );
}
