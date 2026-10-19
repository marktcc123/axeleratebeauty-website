import { redirect } from "next/navigation";
import { PageIntro } from "@/components/site/PageIntro";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const supabase = await createServerSupabase();
  const { data: organization } = supabase && session.organizationId
    ? await supabase.from("organizations").select("*").eq("id", session.organizationId).maybeSingle()
    : { data: null };

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <PageIntro eyebrow="Business Profile" title={organization?.name ?? "Business profile"} />
        <dl className="mt-10 space-y-4 text-sm">
          <div><dt className="text-muted">Status</dt><dd>{organization?.verification_status ?? session.verificationStatus}</dd></div>
          <div><dt className="text-muted">Email</dt><dd>{session.email}</dd></div>
          <div><dt className="text-muted">Phone</dt><dd>{organization?.phone ?? "—"}</dd></div>
          <div><dt className="text-muted">Address</dt><dd>{[organization?.address_line1, organization?.city, organization?.state, organization?.postal_code].filter(Boolean).join(", ") || "—"}</dd></div>
          <div><dt className="text-muted">License notes</dt><dd>{organization?.license_info || "None provided"}</dd></div>
        </dl>
        <p className="mt-8 text-sm text-muted">
          To update verification documents, email sales@axeleratebeauty.com. Document uploads stay private and are not shown on the public site.
        </p>
      </div>
    </section>
  );
}
