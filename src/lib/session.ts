import { headers } from "next/headers";
import { DEV_PREVIEW_SESSION, isDevPreviewEnabled } from "@/lib/dev-preview";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/types";

export async function getSession(): Promise<SessionContext> {
  const host = (await headers()).get("host");
  if (isDevPreviewEnabled(host)) {
    return DEV_PREVIEW_SESSION;
  }

  const empty: SessionContext = {
    userId: null,
    email: null,
    fullName: null,
    isPlatformAdmin: false,
    organizationId: null,
    organizationName: null,
    verificationStatus: null,
    orgRole: null,
  };

  const supabase = await createServerSupabase();
  if (!supabase) return empty;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_admin, organization_id, organizations(name, verification_status)")
    .eq("id", user.id)
    .maybeSingle();

  const organization = Array.isArray(profile?.organizations)
    ? profile?.organizations[0]
    : profile?.organizations;

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    isPlatformAdmin: Boolean(profile?.is_admin),
    organizationId: profile?.organization_id ?? null,
    organizationName: organization?.name ?? null,
    verificationStatus: organization?.verification_status ?? null,
    orgRole: profile?.role ?? "pending",
  };
}
