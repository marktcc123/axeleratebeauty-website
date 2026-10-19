"use client";

import { useState } from "react";
import { loginBusiness, registerBusiness, requestPasswordReset } from "@/app/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <form
        className="grid gap-4"
        action={async (formData) => {
          const result = await loginBusiness(formData);
          if (result?.error) setError(result.error);
        }}
      >
        <label className="text-sm">Business email<input name="email" type="email" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
        <label className="text-sm">Password<input name="password" type="password" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
        {error && <p className="text-sm text-accent-tac">{error}</p>}
        <button className="bg-charcoal px-6 py-3 text-sm text-cream">Sign in</button>
      </form>
      <form
        className="grid gap-3"
        action={async (formData) => {
          const result = await requestPasswordReset(formData);
          setError(result.error);
          setMessage(result.message ?? null);
        }}
      >
        <p className="text-sm text-muted">Forgot password</p>
        <input name="email" type="email" placeholder="Business email" className="border border-sand-200 px-3 py-2" />
        <button className="text-left text-sm underline-offset-4 hover:underline">Send reset email</button>
        {message && <p className="text-sm text-muted">{message}</p>}
      </form>
    </div>
  );
}

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        const result = await registerBusiness(formData);
        if (result?.error) setError(result.error);
      }}
    >
      <label className="text-sm">Full name<input name="fullName" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">Business email<input name="email" type="email" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">Password (10+ characters)<input name="password" type="password" required minLength={10} className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">Business name<input name="businessName" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">Business phone<input name="phone" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">Website (optional)<input name="website" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">Business type
        <select name="businessType" className="mt-1 w-full border border-sand-200 px-3 py-2">
          <option value="salon">Salon</option>
          <option value="esthetician">Esthetician</option>
          <option value="spa">Spa</option>
          <option value="chain">Multi-location</option>
          <option value="other">Other beauty business</option>
        </select>
      </label>
      <label className="text-sm">Street address<input name="addressLine1" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">City<input name="city" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">State<input name="state" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">ZIP<input name="postalCode" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm">Professional license information, if relevant<textarea name="licenseInfo" rows={3} className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="flex items-start gap-2 text-sm">
        <input name="accepted" type="checkbox" className="mt-1" />
        <span>I acknowledge the Privacy Policy and that Terms of Sale will apply to any purchase. Draft policy pages are not final legal terms.</span>
      </label>
      {error && <p className="text-sm text-accent-tac">{error}</p>}
      <button className="bg-charcoal px-6 py-3 text-sm text-cream">Submit registration</button>
    </form>
  );
}
