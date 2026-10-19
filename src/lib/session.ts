import { headers } from "next/headers";
import { readActiveLocationId, resolveActiveLocation } from "@/lib/active-location";
import { DEV_PREVIEW_SESSION, isDevPreviewEnabled } from "@/lib/dev-preview";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AuthorizedLocation, SessionContext } from "@/lib/types";

const empty: SessionContext = {
  userId: null,
  email: null,
  fullName: null,
  isPlatformAdmin: false,
  organizationId: null,
  organizationName: null,
  verificationStatus: null,
  orgRole: null,
  locations: [],
  activeLocationId: null,
};

export async function getSession(): Promise<SessionContext> {
  const host = (await headers()).get("host");
  if (isDevPreviewEnabled(host)) {
    return DEV_PREVIEW_SESSION;
  }

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

  const { data: memberships } = await supabase
    .from("location_memberships")
    .select("role, locations(id, name, city, state, is_active)")
    .eq("user_id", user.id);

  const locations: AuthorizedLocation[] = (memberships ?? [])
    .map((row) => {
      const location = Array.isArray(row.locations) ? row.locations[0] : row.locations;
      if (!location?.id || location.is_active === false) return null;
      return {
        id: location.id,
        name: location.name,
        city: location.city ?? null,
        state: location.state ?? null,
        role: row.role,
      } satisfies AuthorizedLocation;
    })
    .filter((location): location is AuthorizedLocation => Boolean(location));

  const requested = await readActiveLocationId();
  const activeLocationId = resolveActiveLocation(locations, requested);

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    isPlatformAdmin: Boolean(profile?.is_admin),
    organizationId: profile?.organization_id ?? null,
    organizationName: organization?.name ?? null,
    verificationStatus: organization?.verification_status ?? null,
    orgRole: profile?.role ?? "pending",
    locations,
    activeLocationId,
  };
}
