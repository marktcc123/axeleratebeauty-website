import type { CatalogSource } from "@/lib/types";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function isStripePublishable() {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function supabaseAuthHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host || null;
  } catch {
    return null;
  }
}

export function stripeAutomaticTax() {
  return process.env.STRIPE_AUTOMATIC_TAX === "true";
}

export function stripeShippingRateId() {
  return process.env.STRIPE_SHIPPING_RATE_ID || null;
}

export function isStripeCheckoutReady() {
  return isStripeConfigured() && stripeAutomaticTax() && Boolean(stripeShippingRateId());
}

export function catalogSource(): CatalogSource {
  return process.env.CATALOG_SOURCE === "zoho_commerce" ? "zoho_commerce" : "supabase_cache";
}

export function isZohoCrmConfigured() {
  return Boolean(
    process.env.ZOHO_CLIENT_ID &&
      process.env.ZOHO_CLIENT_SECRET &&
      process.env.ZOHO_REFRESH_TOKEN &&
      process.env.ZOHO_ACCOUNTS_URL,
  );
}

export function isZohoCommerceConfigured() {
  return Boolean(isZohoCrmConfigured() && process.env.ZOHO_COMMERCE_ORG_ID);
}
