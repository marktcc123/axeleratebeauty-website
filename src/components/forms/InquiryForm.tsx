"use client";

import { useState } from "react";
import { submitInquiry } from "@/app/actions/inquiries";

export function InquiryForm({
  source,
  programSlug,
  defaultName,
  defaultEmail,
  defaultBusiness,
}: {
  source: string;
  programSlug?: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultBusiness?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mailto, setMailto] = useState<string | null>(null);

  if (success) {
    return (
      <div className="mt-10 border border-sand-200 bg-white p-6" role="status">
        <p className="font-serif text-2xl text-ink">Inquiry received.</p>
        <p className="mt-3 text-sm text-muted">
          Your request was saved. A specialist will follow up using the business email you provided.
        </p>
        {mailto && (
          <p className="mt-4 text-sm text-muted">
            Optional backup:{" "}
            <a href={mailto} className="underline-offset-4 hover:underline">
              email the team directly
            </a>
            . Opening mail is not required to complete this request.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="mt-10 grid gap-4"
      action={async (formData) => {
        const result = await submitInquiry(formData);
        if (result.error) {
          setError(result.error);
          setSuccess(false);
          return;
        }
        setError(null);
        setSuccess(true);
        setMailto(result.mailto ?? null);
      }}
    >
      <input type="hidden" name="source" value={source} />
      {programSlug ? <input type="hidden" name="programSlug" value={programSlug} /> : null}
      <label className="text-sm" htmlFor="inquiry-name">
        Full name
        <input id="inquiry-name" name="name" defaultValue={defaultName} required autoComplete="name" className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm" htmlFor="inquiry-email">
        Business email
        <input id="inquiry-email" name="email" type="email" defaultValue={defaultEmail} required autoComplete="email" className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm" htmlFor="inquiry-business">
        Business name
        <input id="inquiry-business" name="businessName" defaultValue={defaultBusiness} required className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm" htmlFor="inquiry-phone">
        Phone
        <input id="inquiry-phone" name="phone" type="tel" autoComplete="tel" className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm" htmlFor="inquiry-locations">
        Number of stores
        <input id="inquiry-locations" name="locationCount" type="number" min={1} max={500} className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      <label className="text-sm" htmlFor="inquiry-timeline">
        Purchase timing
        <select id="inquiry-timeline" name="purchaseTimeline" className="mt-1 w-full border border-sand-200 bg-white px-3 py-2">
          <option value="">Select a timeframe</option>
          <option value="immediate">Ready to start</option>
          <option value="30_days">Within 30 days</option>
          <option value="90_days">Within 90 days</option>
          <option value="exploring">Exploring options</option>
        </select>
      </label>
      <label className="text-sm" htmlFor="inquiry-message">
        How can we help?
        <textarea id="inquiry-message" name="message" rows={5} className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
      </label>
      {error && (
        <p id="inquiry-error" className="text-sm text-accent-tac" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="bg-charcoal px-6 py-3 text-sm text-cream">
        Submit inquiry
      </button>
    </form>
  );
}
