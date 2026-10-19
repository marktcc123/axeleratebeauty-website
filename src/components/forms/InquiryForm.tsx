"use client";

import { useState } from "react";
import { submitInquiry } from "@/app/actions/inquiries";

export function InquiryForm({
  source,
  defaultName,
  defaultEmail,
  defaultBusiness,
}: {
  source: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultBusiness?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-10 grid gap-4"
      action={async (formData) => {
        const result = await submitInquiry(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.mailto) window.location.href = result.mailto;
      }}
    >
      <input type="hidden" name="source" value={source} />
      <label className="text-sm">
        Full name
        <input name="name" defaultValue={defaultName} required className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm">
        Business email
        <input name="email" type="email" defaultValue={defaultEmail} required className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm">
        Business name
        <input name="businessName" defaultValue={defaultBusiness} required className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm">
        Phone
        <input name="phone" className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm">
        How can we help?
        <textarea name="message" rows={5} className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      {error && <p className="text-sm text-accent-tac">{error}</p>}
      <button type="submit" className="bg-charcoal px-6 py-3 text-sm text-cream">
        Submit inquiry
      </button>
    </form>
  );
}
