import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/AuthForms";
import { PageIntro } from "@/components/site/PageIntro";
import { authErrorMessage } from "@/lib/auth/messages";
import { getSession } from "@/lib/session";

export default async function ResetPage() {
  const session = await getSession();
  const signedIn = Boolean(session.userId);

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-md">
        <PageIntro eyebrow="Reset password" title="Choose a new password." />
        {!signedIn ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-accent-tac" role="alert">
              {authErrorMessage("session_required")}
            </p>
            <Link href="/partner/login" className="inline-block text-sm underline-offset-4 hover:underline">
              Return to sign in and request a new reset email
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <ResetPasswordForm />
          </div>
        )}
      </div>
    </section>
  );
}
