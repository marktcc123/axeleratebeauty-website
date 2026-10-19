"use server";

import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { writeActiveLocationId } from "@/lib/active-location";
import { isSupabaseConfigured, siteUrl } from "@/lib/config";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function attachPrimaryLocation(
  service: NonNullable<Awaited<ReturnType<typeof createServiceSupabase>>>,
  organizationId: string,
  userId: string,
  input: { name: string; addressLine1: string; city: string; state: string; postalCode: string },
) {
  const { data: location } = await service
    .from("locations")
    .insert({
      organization_id: organizationId,
      name: input.name,
      address_line1: input.addressLine1,
      city: input.city,
      state: input.state,
      postal_code: input.postalCode,
    })
    .select("id")
    .single();

  if (location) {
    await service.from("location_memberships").insert({
      user_id: userId,
      location_id: location.id,
      role: "hq_admin",
    });
    await writeActiveLocationId(location.id);
  }
}

export async function registerBusiness(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Account services are not configured yet." };
  }

  const email = formText(formData, "email").toLowerCase();
  const password = formText(formData, "password");
  const fullName = formText(formData, "fullName");
  const businessName = formText(formData, "businessName");
  const phone = formText(formData, "phone");
  const website = formText(formData, "website");
  const businessType = formText(formData, "businessType");
  const addressLine1 = formText(formData, "addressLine1");
  const city = formText(formData, "city");
  const state = formText(formData, "state");
  const postalCode = formText(formData, "postalCode");
  const licenseInfo = formText(formData, "licenseInfo");
  const inviteToken = formText(formData, "inviteToken");
  const accepted = formText(formData, "accepted") === "on";

  if (!email || !password || !fullName || !phone) {
    return { error: "Please complete the required contact fields." };
  }
  if (!inviteToken && (!businessName || !addressLine1 || !city || !state || !postalCode)) {
    return { error: "Please complete the required business fields, or use a valid invitation." };
  }
  if (password.length < 10) {
    return { error: "Use a password of at least 10 characters." };
  }
  if (!accepted) {
    return { error: "Please acknowledge the terms and privacy notices." };
  }

  const limited = checkRateLimit(clientKey("register", email), 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: "Please wait before creating another account." };
  }

  const supabase = await createServerSupabase();
  const service = await createServiceSupabase();
  if (!supabase || !service) {
    return { error: "Account services are not configured yet." };
  }

  let organizationId: string | null = null;
  let locationId: string | null = null;
  let role = "company_admin";

  if (inviteToken) {
    const { data: invite } = await service
      .from("organization_invites")
      .select("id, organization_id, location_id, email, expires_at, accepted_at, role")
      .eq("token_hash", hashToken(inviteToken))
      .maybeSingle();

    if (!invite || invite.accepted_at || new Date(invite.expires_at).getTime() < Date.now()) {
      return { error: "This invitation is invalid or has expired." };
    }
    if (invite.email.toLowerCase() !== email) {
      return { error: "This invitation is assigned to a different email address." };
    }
    organizationId = invite.organization_id;
    locationId = invite.location_id;
    role = invite.role === "company_admin" ? "company_admin" : "member";
    await service.from("organization_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/partner/dashboard`,
    },
  });
  if (error || !data.user) {
    return { error: "Unable to create this account. Try another email or sign in." };
  }

  if (!organizationId) {
    const { data: organization, error: orgError } = await service
      .from("organizations")
      .insert({
        name: businessName,
        business_type: businessType || null,
        website: website || null,
        phone,
        address_line1: addressLine1,
        city,
        state,
        postal_code: postalCode,
        license_info: licenseInfo || null,
        verification_status: "pending",
      })
      .select("id")
      .single();

    if (orgError || !organization) {
      return { error: "The login was created, but the new business record could not be saved. Contact support." };
    }
    organizationId = organization.id;
  }

  const { error: profileError } = await service.from("profiles").upsert({
    id: data.user.id,
    organization_id: organizationId,
    full_name: fullName,
    role,
    is_admin: false,
  });
  if (profileError) {
    return { error: "The login was created, but the profile could not be linked. Contact support." };
  }
  if (!organizationId) {
    return { error: "The login was created, but no business record is linked. Contact support." };
  }

  if (locationId) {
    await service.from("location_memberships").upsert({
      user_id: data.user.id,
      location_id: locationId,
      role: role === "company_admin" ? "hq_admin" : "buyer",
    });
    await writeActiveLocationId(locationId);
  } else {
    await attachPrimaryLocation(service, organizationId, data.user.id, {
      name: businessName,
      addressLine1,
      city,
      state,
      postalCode,
    });
  }

  await service.from("audit_events").insert({
    actor_id: data.user.id,
    action: inviteToken ? "professional_invite_accepted" : "professional_registration_completed",
    entity_type: "organization",
    entity_id: organizationId,
  });

  if (!data.session) {
    return {
      error: null,
      message: "Check your email to confirm the account, then sign in. Entering a company name does not grant access to an existing group.",
    };
  }

  redirect("/partner/dashboard");
}

export async function loginBusiness(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Account services are not configured yet." };
  }
  const email = formText(formData, "email").toLowerCase();
  const password = formText(formData, "password");
  const limited = checkRateLimit(clientKey("login", email), 10, 15 * 60 * 1000);
  if (!limited.ok) return { error: "Too many sign-in attempts. Please wait and try again." };

  const supabase = await createServerSupabase();
  if (!supabase) return { error: "Account services are not configured yet." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  redirect("/partner/dashboard");
}

export async function logoutBusiness() {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  await writeActiveLocationId(null);
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Account services are not configured yet." };
  }
  const email = formText(formData, "email").toLowerCase();
  const supabase = await createServerSupabase();
  if (!supabase || !email) return { error: "Enter the business email on the account." };
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/partner/reset`,
  });
  return { error: null, message: "If an account exists, a reset email will be sent." };
}

export async function updatePassword(formData: FormData) {
  const password = formText(formData, "password");
  if (password.length < 10) return { error: "Use a password of at least 10 characters." };
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "Account services are not configured yet." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "The password could not be updated. Request a new reset email." };
  redirect("/partner/dashboard");
}

export async function createOrganizationInvite(formData: FormData) {
  const { AuthorizationError, requirePlatformAdmin, requireAuthorizedService } = await import("@/lib/authz");
  let session;
  try {
    session = await requirePlatformAdmin();
  } catch (error) {
    return { error: error instanceof AuthorizationError ? error.message : "Administrator access required." };
  }
  let service;
  try {
    service = await requireAuthorizedService(session);
  } catch (error) {
    return { error: error instanceof AuthorizationError ? error.message : "Account services are not configured yet." };
  }
  const organizationId = formText(formData, "organizationId");
  const email = formText(formData, "email").toLowerCase();
  const locationId = formText(formData, "locationId") || null;
  if (!organizationId || !email) return { error: "Organization and email are required." };

  const token = randomBytes(24).toString("hex");
  const { error } = await service.from("organization_invites").insert({
    organization_id: organizationId,
    location_id: locationId,
    email,
    token_hash: hashToken(token),
    role: formText(formData, "role") || "member",
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: session.userId,
  });
  if (error) return { error: "The invitation could not be created." };
  return { error: null, token, registerUrl: `${siteUrl()}/partner/register?invite=${token}` };
}

export async function selectActiveLocation(locationId: string) {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session.locations.some((location) => location.id === locationId)) {
    return { error: "That store is not available on this account." };
  }
  await writeActiveLocationId(locationId);
  return { error: null };
}
