"use server";

import { redirect } from "next/navigation";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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
  const accepted = formText(formData, "accepted") === "on";

  if (!email || !password || !fullName || !businessName || !phone || !addressLine1 || !city || !state || !postalCode) {
    return { error: "Please complete the required business fields." };
  }
  if (password.length < 10) {
    return { error: "Use a password of at least 10 characters." };
  }
  if (!accepted) {
    return { error: "Please acknowledge the terms and privacy notices." };
  }

  const supabase = await createServerSupabase();
  const service = await createServiceSupabase();
  if (!supabase || !service) {
    return { error: "Account services are not configured yet." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error || !data.user) {
    return { error: "Unable to create this account. Try another email or sign in." };
  }

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
    return { error: "The account was created, but business details could not be saved. Contact support." };
  }

  await service.from("profiles").upsert({
    id: data.user.id,
    organization_id: organization.id,
    full_name: fullName,
    role: "company_admin",
    is_admin: false,
  });

  await service.from("audit_events").insert({
    actor_id: data.user.id,
    action: "professional_registration_completed",
    entity_type: "organization",
    entity_id: organization.id,
  });

  redirect("/partner/dashboard");
}

export async function loginBusiness(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Account services are not configured yet." };
  }
  const email = formText(formData, "email").toLowerCase();
  const password = formText(formData, "password");
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "Account services are not configured yet." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  redirect("/partner/dashboard");
}

export async function logoutBusiness() {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
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
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/partner/login`,
  });
  return { error: null, message: "If an account exists, a reset email will be sent." };
}
