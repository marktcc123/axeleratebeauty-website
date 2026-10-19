import { headers } from "next/headers";
import Link from "next/link";
import { LoginForm } from "@/components/forms/AuthForms";
import { PageIntro } from "@/components/site/PageIntro";
import { isSupabaseConfigured } from "@/lib/config";
import { isDevPreviewEnabled } from "@/lib/dev-preview";

export default async function LoginPage() {
  const preview = isDevPreviewEnabled((await headers()).get("host"));

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
