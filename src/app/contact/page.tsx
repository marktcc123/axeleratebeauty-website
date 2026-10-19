import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageIntro } from "@/components/site/PageIntro";
import { getSession } from "@/lib/session";

export default async function ContactPage() {
  const session = await getSession();
  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-xl">
        <PageIntro eyebrow="Contact" title="Talk with the U.S. team.">
          <p>
            sales@axeleratebeauty.com · +1 (901) 661-9930. If you already have a business
            account, this inquiry is linked to that organization when possible.
          </p>
        </PageIntro>
        <InquiryForm
          source="contact"
          defaultName={session.fullName ?? undefined}
          defaultEmail={session.email ?? undefined}
          defaultBusiness={session.organizationName ?? undefined}
        />
      </div>
    </section>
  );
}
