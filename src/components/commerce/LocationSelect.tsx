"use client";

import { selectActiveLocation } from "@/app/actions/auth";
import type { AuthorizedLocation } from "@/lib/types";

export function LocationSelect({
  locations,
  activeLocationId,
}: {
  locations: AuthorizedLocation[];
  activeLocationId: string | null;
}) {
  if (locations.length === 0) {
    return <p className="text-sm text-muted">No authorized store is linked to this account yet.</p>;
  }

  return (
    <form
      className="grid gap-2 sm:max-w-md"
      action={async (formData) => {
        await selectActiveLocation(String(formData.get("locationId") ?? ""));
      }}
    >
      <label htmlFor="active-location" className="text-sm text-muted">
        Ordering store
        <select
          id="active-location"
          name="locationId"
          defaultValue={activeLocationId ?? locations[0].id}
          className="mt-1 w-full border border-sand-200 bg-white px-3 py-2"
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
              {location.city ? ` · ${location.city}` : ""}
              {location.state ? `, ${location.state}` : ""}
            </option>
          ))}
        </select>
      </label>
      <button className="justify-self-start text-sm underline-offset-4 hover:underline">Use this store</button>
    </form>
  );
}
