"use client";

import { useState } from "react";
import { loginBusiness, registerBusiness, requestPasswordReset, updatePassword } from "@/app/actions/auth";

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
        <label className="text-sm" htmlFor="login-email">
          Business email
          <input id="login-email" name="email" type="email" required autoComplete="email" className="mt-1 w-full border border-sand-200 px-3 py-2" />
        </label>
        <label className="text-sm" htmlFor="login-password">
          Password
          <input id="login-password" name="password" type="password" required autoComplete="current-password" className="mt-1 w-full border border-sand-200 px-3 py-2" />
        </label>
        {error && <p className="text-sm text-accent-tac" role="alert">{error}</p>}
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
        <label className="sr-only" htmlFor="reset-email">Business email</label>
        <input id="reset-email" name="email" type="email" placeholder="Business email" autoComplete="email" className="border border-sand-200 px-3 py-2" />
        <button className="text-left text-sm underline-offset-4 hover:underline">Send reset email</button>
        {message && <p className="text-sm text-muted">{message}</p>}
      </form>
    </div>
  );
}

export function RegisterForm({ inviteToken }: { inviteToken?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        const result = await registerBusiness(formData);
        if (result?.error) {
          setError(result.error);
          setMessage(null);
          return;
        }
        setError(null);
        setMessage(result?.message ?? null);
      }}
    >
      {inviteToken ? <input type="hidden" name="inviteToken" value={inviteToken} /> : null}
      <label className="text-sm" htmlFor="reg-name">Full name<input id="reg-name" name="fullName" required autoComplete="name" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm" htmlFor="reg-email">Business email<input id="reg-email" name="email" type="email" required autoComplete="email" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      <label className="text-sm" htmlFor="reg-password">Password (10+ characters)<input id="reg-password" name="password" type="password" required minLength={10} autoComplete="new-password" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      {!inviteToken && (
        <>
          <label className="text-sm" htmlFor="reg-business">Business name<input id="reg-business" name="businessName" required className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
          <p className="text-sm text-muted">Entering a company name creates a new pending account. It does not grant access to an existing salon group.</p>
        </>
      )}
      <label className="text-sm" htmlFor="reg-phone">Business phone<input id="reg-phone" name="phone" required autoComplete="tel" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
      {!inviteToken && (
        <>
          <label className="text-sm" htmlFor="reg-website">Website (optional)<input id="reg-website" name="website" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
          <label className="text-sm" htmlFor="reg-type">Business type
            <select id="reg-type" name="businessType" className="mt-1 w-full border border-sand-200 px-3 py-2">
              <option value="salon">Salon</option>
              <option value="esthetician">Esthetician</option>
              <option value="spa">Spa</option>
              <option value="chain">Multi-location</option>
              <option value="other">Other beauty business</option>
            </select>
          </label>
          <label className="text-sm" htmlFor="reg-address">Street address<input id="reg-address" name="addressLine1" required autoComplete="street-address" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
          <label className="text-sm" htmlFor="reg-city">City<input id="reg-city" name="city" required autoComplete="address-level2" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
          <label className="text-sm" htmlFor="reg-state">State<input id="reg-state" name="state" required autoComplete="address-level1" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
          <label className="text-sm" htmlFor="reg-zip">ZIP<input id="reg-zip" name="postalCode" required autoComplete="postal-code" className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
          <label className="text-sm" htmlFor="reg-license">Professional license information, if relevant<textarea id="reg-license" name="licenseInfo" rows={3} className="mt-1 w-full border border-sand-200 px-3 py-2" /></label>
        </>
      )}
      {inviteToken && (
        <p className="text-sm text-muted">This registration uses an administrator invitation and will join the assigned business and store only.</p>
      )}
      <label className="flex items-start gap-2 text-sm">
        <input name="accepted" type="checkbox" className="mt-1" />
        <span>I acknowledge the Privacy Policy and that Terms of Sale will apply to any purchase. Draft policy pages are not final legal terms.</span>
      </label>
      {error && <p className="text-sm text-accent-tac" role="alert">{error}</p>}
      {message && <p className="text-sm text-muted" role="status">{message}</p>}
      <button className="bg-charcoal px-6 py-3 text-sm text-cream">Submit registration</button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-4"
      action={async (formData) => {
        const result = await updatePassword(formData);
        if (result?.error) setError(result.error);
      }}
    >
      <label className="text-sm" htmlFor="new-password">
        New password
        <input id="new-password" name="password" type="password" required minLength={10} autoComplete="new-password" className="mt-1 w-full border border-sand-200 px-3 py-2" />
      </label>
      {error && <p className="text-sm text-accent-tac" role="alert">{error}</p>}
      <button className="bg-charcoal px-6 py-3 text-sm text-cream">Update password</button>
    </form>
  );
}
