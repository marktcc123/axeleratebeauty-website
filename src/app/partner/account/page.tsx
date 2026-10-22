import Link from "next/link";
import { redirect } from "next/navigation";
import { CommerceHeader, CommercePage } from "@/components/commerce/CommercePage";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { formatMoney } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

function accountAccessCopy(input: {
  emailVerified: boolean;
  verificationStatus: string | null;
  locationCount: number;
}) {
  if (!input.emailVerified) {
    return "Confirm your email to shop at your business price.";
  }
  if (input.verificationStatus === "suspended") {
    return "Purchasing is paused on this account. Use Support below if you need help.";
  }
  if (input.verificationStatus === "pending" || input.verificationStatus === "rejected") {
    return "This account does not have shopping access yet. Contact support if you expected to order already.";
  }
  if (input.locationCount === 0) {
    return "A shipping location is required before you can shop.";
  }
  return "You can shop published products at your business price.";
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const { section } = await searchParams;
  const focus = section === "billing" || section === "support" ? section : "profile";

  const supabase = await createServerSupabase();
  const { data: organization } = supabase && session.organizationId
    ? await supabase.from("organizations").select("*").eq("id", session.organizationId).maybeSingle()
    : { data: null };

  const { data: orders } = supabase && session.organizationId
    ? await supabase
        .from("orders")
        .select("id, order_number, order_kind, payment_status, total_cents, created_at, location_id")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] };

  const allowed = new Set(session.locations.map((location) => location.id));
  const visible = (orders ?? []).filter((order) => !order.location_id || allowed.has(order.location_id));
  const replenishment = visible.filter((order) => order.order_kind !== "contract_installment");
  const installments = visible.filter((order) => order.order_kind === "contract_installment");
  const accessCopy = accountAccessCopy({
    emailVerified: session.emailVerified,
    verificationStatus: organization?.verification_status ?? session.verificationStatus,
    locationCount: session.locations.length,
  });

  return (
    <CommercePage narrow>
        <CommerceHeader
          title={organization?.name ?? "Your business"}
          description="Company details, recent payments, and support."
        />

        <nav aria-label="Account sections" className="mt-6 flex flex-wrap gap-4 text-sm">
          <a href="#profile" className={focus === "profile" ? "font-medium text-ink" : "text-muted underline-offset-4 hover:underline"}>
            Business
          </a>
          <a href="#billing" className={focus === "billing" ? "font-medium text-ink" : "text-muted underline-offset-4 hover:underline"}>
            Billing
          </a>
          <a href="#support" className={focus === "support" ? "font-medium text-ink" : "text-muted underline-offset-4 hover:underline"}>
            Support
          </a>
        </nav>

        <section id="profile" className="mt-10 scroll-mt-24 border-t border-sand-200 pt-8">
          <h2 className="font-serif text-2xl text-ink">Business</h2>
          <p className="mt-3 text-sm text-muted">{accessCopy}</p>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Contact email</dt>
              <dd className="break-all text-stone-deep">{session.email}</dd>
            </div>
            {session.fullName ? (
              <div>
                <dt className="text-muted">Contact name</dt>
                <dd className="text-stone-deep">{session.fullName}</dd>
              </div>
            ) : null}
            {organization?.phone ? (
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="text-stone-deep">{organization.phone}</dd>
              </div>
            ) : null}
            {(organization?.address_line1 || organization?.city) ? (
              <div>
                <dt className="text-muted">Business address</dt>
                <dd className="text-stone-deep">
                  {[organization?.address_line1, organization?.city, organization?.state, organization?.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
            ) : null}
            {session.locations.length > 0 ? (
              <div>
                <dt className="text-muted">
                  {session.locations.length === 1 ? "Shipping address" : "Shipping locations"}
                </dt>
                <dd className="text-stone-deep">
                  {session.locations
                    .map((location) =>
                      `${location.name}${location.city ? ` · ${location.city}` : ""}${location.state ? `, ${location.state}` : ""}`,
                    )
                    .join("; ")}
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-6 text-sm text-muted">
            To update company records, email sales@axeleratebeauty.com.
          </p>
        </section>

        <section id="billing" className="mt-12 scroll-mt-24 border-t border-sand-200 pt-8">
          <h2 className="font-serif text-2xl text-ink">Billing</h2>
          <p className="mt-2 text-sm text-muted">
            Recent payments only. Opening a confirmation page does not prove payment succeeded.
          </p>
          <div className="mt-6">
            <h3 className="text-sm uppercase tracking-[0.14em] text-muted">Product orders</h3>
            {!replenishment.length ? (
              <p className="mt-3 text-sm text-muted">No product payments yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {replenishment.map((order) => (
                  <li key={order.id} className="border border-sand-200 bg-white px-4 py-3 text-sm">
                    <span className="break-all">{order.order_number}</span>
                    <span className="text-muted"> · {order.payment_status} · {formatMoney(order.total_cents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {installments.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-sm uppercase tracking-[0.14em] text-muted">Contract installments</h3>
              <p className="mt-2 text-sm text-muted">Scheduled contract payments stay on the original agreement.</p>
              <ul className="mt-3 space-y-2">
                {installments.map((order) => (
                  <li key={order.id} className="border border-sand-200 bg-white px-4 py-3 text-sm">
                    <span className="break-all">{order.order_number}</span>
                    <span className="text-muted"> · {order.payment_status} · {formatMoney(order.total_cents)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Link href="/partner/orders" className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
            Open full order history
          </Link>
        </section>

        <section id="support" className="mt-12 scroll-mt-24 border-t border-sand-200 pt-8">
          <h2 className="font-serif text-2xl text-ink">Support</h2>
          <p className="mt-2 text-sm text-muted">
            Cancellations, refund questions, delivery issues, or training follow-up.
          </p>
          <div className="mt-6">
            <InquiryForm
              source="after_sales"
              defaultName={session.fullName ?? undefined}
              defaultEmail={session.email ?? undefined}
              defaultBusiness={session.organizationName ?? undefined}
            />
          </div>
        </section>
    </CommercePage>
  );
}
