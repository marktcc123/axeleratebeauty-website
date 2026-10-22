import { RegisterForm } from "@/components/forms/AuthForms";
import { PageIntro } from "@/components/site/PageIntro";
import { isSupabaseConfigured } from "@/lib/config";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-xl">
        <PageIntro eyebrow="Business Registration" title="Apply for a professional account.">
          <p>
            Registration creates a pending account. Purchasing is available only after an
            administrator approves the business. A typed company name never grants access to
            an existing salon group.
          </p>
        </PageIntro>
        {!isSupabaseConfigured() && (
          <p className="mt-6 text-sm text-muted">Supabase is not configured, so new accounts cannot be stored yet.</p>
        )}
        <div className="mt-8">
          <RegisterForm inviteToken={invite} />
        </div>
      </div>
    </section>
  );
}
