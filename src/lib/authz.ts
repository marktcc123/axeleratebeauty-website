import { getSession } from "@/lib/session";
import { createServiceSupabase } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/types";
import { canAccessLocation, canPurchase } from "@/lib/types";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly code: "unauthenticated" | "forbidden" | "not_configured",
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireIdentifiedUser() {
  const session = await getSession();
  if (!session.userId) {
    throw new AuthorizationError("Sign in to continue.", "unauthenticated");
  }
  return session;
}

export async function requireApprovedBuyer() {
  const session = await requireIdentifiedUser();
  if (!canPurchase(session)) {
    throw new AuthorizationError("Purchasing requires a confirmed email, an active business profile, and a shipping location.", "forbidden");
  }
  return session;
}

export async function requirePlatformAdmin() {
  const session = await requireIdentifiedUser();
  if (!session.isPlatformAdmin) {
    throw new AuthorizationError("Administrator access required.", "forbidden");
  }
  return session;
}

export async function requireAuthorizedService(session: SessionContext) {
  if (!session.userId) {
    throw new AuthorizationError("A verified actor is required before using elevated access.", "forbidden");
  }
  const service = await createServiceSupabase();
  if (!service) {
    throw new AuthorizationError("Account services are not configured yet.", "not_configured");
  }
  return service;
}

export function assertLocationAccess(session: SessionContext, locationId: string | null) {
  if (!canAccessLocation(session, locationId)) {
    throw new AuthorizationError("This store is not available on the signed-in account.", "forbidden");
  }
}
