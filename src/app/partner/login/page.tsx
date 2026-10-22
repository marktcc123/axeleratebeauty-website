import { headers } from "next/headers";
import Link from "next/link";
import { LoginForm } from "@/components/forms/AuthForms";
import { PageIntro } from "@/components/site/PageIntro";
import { authErrorMessage, authStatusMessage } from "@/lib/auth/messages";
import { isSupabaseConfigured, supabaseAuthHost } from "@/lib/config";
import { isDevPreviewEnabled } from "@/lib/dev-preview";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const preview = isDevPreviewEnabled((await headers()).get("host"));
  const params = await searchParams;
  const callbackError = authErrorMessage(params.error);
  const status = authStatusMessage(params.status);
  const authHost = supabaseAuthHost();

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-md">
        <PageIntro eyebrow="Partner Login" title="Welcome back." />
        {preview && (
          <p className="mt-6 text-sm text-muted">
            Local preview is enabled.{" "}
            <Link href="/partner/dashboard" className="underline-offset-4 hover:underline">
              Open the partner dashboard
            </Link>{" "}
            without signing in.
          </p>
        )}
        {!isSupabaseConfigured() && !preview && (
          <p className="mt-6 text-sm text-muted">Authentication is not connected yet. Add Supabase credentials to enable login.</p>
        )}
        {isSupabaseConfigured() && authHost && (
          <p className="mt-6 text-xs text-muted">Auth host: {authHost}</p>
        )}
        {callbackError && (
          <p className="mt-6 text-sm text-accent-tac" role="alert">
            {callbackError}
          </p>
        )}
        {status && (
          <p className="mt-6 text-sm text-muted" role="status">
            {status}
          </p>
        )}
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          New business? <Link href="/partner/register" className="underline-offset-4 hover:underline">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
