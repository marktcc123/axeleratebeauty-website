import { ResetPasswordForm } from "@/components/forms/AuthForms";
import { PageIntro } from "@/components/site/PageIntro";

export default function ResetPage() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-md">
        <PageIntro eyebrow="Reset password" title="Choose a new password." />
        <div className="mt-8">
          <ResetPasswordForm />
        </div>
      </div>
    </section>
  );
}
