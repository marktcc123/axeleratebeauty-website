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

  const selected = locations.find((location) => location.id === activeLocationId) ?? locations[0];
  const label = `${selected.name}${selected.city ? ` · ${selected.city}` : ""}${selected.state ? `, ${selected.state}` : ""}`;

  if (locations.length === 1) {
    return (
      <p className="text-sm text-stone-deep">
        Ordering store: <strong>{label}</strong>
      </p>
    );
  }

  return (
    <form className="sm:max-w-md">
      <label htmlFor="active-location" className="text-sm text-muted">
        Ordering store
        <select
          id="active-location"
          name="locationId"
          defaultValue={activeLocationId ?? locations[0].id}
          className="mt-1 w-full border border-sand-200 bg-white px-3 py-2"
          onChange={async (event) => {
            const formData = new FormData();
            formData.set("locationId", event.target.value);
            await selectActiveLocation(String(formData.get("locationId") ?? ""));
          }}
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
    </form>
  );
}
