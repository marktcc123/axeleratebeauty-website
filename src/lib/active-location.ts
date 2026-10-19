import { cookies } from "next/headers";
import type { AuthorizedLocation } from "@/lib/types";

const COOKIE = "ab_active_location";

export async function readActiveLocationId() {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function writeActiveLocationId(locationId: string | null) {
  const store = await cookies();
  if (!locationId) {
    store.delete(COOKIE);
    return;
  }
  store.set(COOKIE, locationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function resolveActiveLocation(locations: AuthorizedLocation[], requestedId: string | null) {
  if (requestedId && locations.some((location) => location.id === requestedId)) {
    return requestedId;
  }
  return locations[0]?.id ?? null;
}
