import Link from "next/link";
import { redirect } from "next/navigation";
import { CommerceHeader, CommercePage } from "@/components/commerce/CommercePage";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { formatMoney } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

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

  return (
    <CommercePage narrow>
        <CommerceHeader
          eyebrow="Account"
          title={organization?.name ?? "Business account"}
          description="Profile, recent payments, and support stay in one place so purchasing stays on Catalog and Orders."
        />

        <nav aria-label="Account sections" className="mt-6 flex flex-wrap gap-4 text-sm">
          <a href="#profile" className={focus === "profile" ? "font-medium text-ink" : "text-muted underline-offset-4 hover:underline"}>
            Profile
          </a>
          <a href="#billing" className={focus === "billing" ? "font-medium text-ink" : "text-muted underline-offset-4 hover:underline"}>
            Billing
          </a>
          <a href="#support" className={focus === "support" ? "font-medium text-ink" : "text-muted underline-offset-4 hover:underline"}>
            Support
          </a>
        </nav>

        <section id="profile" className="mt-10 scroll-mt-24 border-t border-sand-200 pt-8">
          <h2 className="font-serif text-2xl text-ink">Profile</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Status</dt>
              <dd className="text-stone-deep">{organization?.verification_status ?? session.verificationStatus}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="break-all text-stone-deep">{session.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="text-stone-deep">{organization?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="text-stone-deep">
                {[organization?.address_line1, organization?.city, organization?.state, organization?.postal_code]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Authorized stores</dt>
              <dd className="text-stone-deep">
                {session.locations.length
                  ? session.locations
                      .map((location) =>
                        `${location.name}${location.city ? ` · ${location.city}` : ""}${location.state ? `, ${location.state}` : ""}`,
                      )
                      .join("; ")
                  : "None linked yet"}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-muted">
            To update verification documents, email sales@axeleratebeauty.com. Uploads stay private.
          </p>
        </section>

        <section id="billing" className="mt-12 scroll-mt-24 border-t border-sand-200 pt-8">
          <h2 className="font-serif text-2xl text-ink">Billing</h2>
          <p className="mt-2 text-sm text-muted">
            Recent payments only. Opening a confirmation page does not prove payment succeeded.
          </p>
          <div className="mt-6">
            <h3 className="text-sm uppercase tracking-[0.14em] text-muted">Replenishment</h3>
            {!replenishment.length ? (
              <p className="mt-3 text-sm text-muted">No replenishment payments yet.</p>
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
          <div className="mt-8">
            <h3 className="text-sm uppercase tracking-[0.14em] text-muted">Contract installments</h3>
            <p className="mt-2 text-sm text-muted">Scheduled contract payments stay on the original agreement.</p>
            {!installments.length ? (
              <p className="mt-3 text-sm text-muted">No installment payments on file.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {installments.map((order) => (
                  <li key={order.id} className="border border-sand-200 bg-white px-4 py-3 text-sm">
                    <span className="break-all">{order.order_number}</span>
                    <span className="text-muted"> · {order.payment_status} · {formatMoney(order.total_cents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link href="/partner/orders" className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
            Open full order history
          </Link>
        </section>

        <section id="support" className="mt-12 scroll-mt-24 border-t border-sand-200 pt-8">
          <h2 className="font-serif text-2xl text-ink">Support</h2>
          <p className="mt-2 text-sm text-muted">
            Cancellations, refund questions, delivery issues, or training follow-up. Saved to the sales team.
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
