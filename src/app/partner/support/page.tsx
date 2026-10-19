import { redirect } from "next/navigation";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageIntro } from "@/components/site/PageIntro";
import { getSession } from "@/lib/session";

export default async function SupportPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-xl">
        <PageIntro eyebrow="Support" title="Request help after an order.">
          <p>
            Use this form for cancellations, refund questions, delivery issues, or training follow-up.
            The request is saved to the sales team. Email is available as a backup, not as proof of submission.
          </p>
        </PageIntro>
        <InquiryForm
          source="after_sales"
          defaultName={session.fullName ?? undefined}
          defaultEmail={session.email ?? undefined}
          defaultBusiness={session.organizationName ?? undefined}
        />
      </div>
    </section>
  );
}
