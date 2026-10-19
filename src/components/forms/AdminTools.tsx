"use client";

import { useState } from "react";
import { mapZohoAccount, retryZohoSync } from "@/app/actions/admin";
import { createOrganizationInvite } from "@/app/actions/auth";

export function AdminZohoMapForm() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <form
      className="mt-6 grid gap-3 md:grid-cols-2"
      action={async (formData) => {
        const result = await mapZohoAccount(formData);
        setMessage(result.error ?? (result.zohoName ? `Mapped to ${result.zohoName}` : "Mapped."));
      }}
    >
      <input name="organizationId" placeholder="Website organization ID" className="border border-sand-200 px-3 py-2" />
      <input name="zohoAccountId" placeholder="Exact Zoho Account ID" className="border border-sand-200 px-3 py-2" />
      <select name="commercialModel" className="border border-sand-200 px-3 py-2">
        <option value="">Internal model unset</option>
        <option value="commission">Commission</option>
        <option value="wholesale">Wholesale</option>
        <option value="internal">Internal</option>
      </select>
      <button className="bg-charcoal px-4 py-2 text-sm text-cream">Verify and map Zoho Account</button>
      {message && <p className="text-sm text-muted md:col-span-2">{message}</p>}
    </form>
  );
}

export function AdminInviteForm() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <form
      className="mt-6 grid gap-3 md:grid-cols-2"
      action={async (formData) => {
        const result = await createOrganizationInvite(formData);
        setMessage(result.error ?? result.registerUrl ?? "Invite created.");
      }}
    >
      <input name="organizationId" placeholder="Organization ID" className="border border-sand-200 px-3 py-2" />
      <input name="email" type="email" placeholder="Invite email" className="border border-sand-200 px-3 py-2" />
      <input name="locationId" placeholder="Location ID (optional)" className="border border-sand-200 px-3 py-2" />
      <button className="bg-charcoal px-4 py-2 text-sm text-cream">Create invite link</button>
      {message && <p className="text-sm text-muted md:col-span-2 break-all">{message}</p>}
    </form>
  );
}

export function AdminRetrySyncForm() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <form
      className="mt-4"
      action={async () => {
        const result = await retryZohoSync();
        setMessage(result.error ?? `Processed ${result.processed ?? 0}, failed ${result.failed ?? 0}.`);
      }}
    >
      <button className="text-sm underline-offset-4 hover:underline">Retry failed Zoho sync jobs</button>
      {message && <p className="mt-2 text-sm text-muted">{message}</p>}
    </form>
  );
}
