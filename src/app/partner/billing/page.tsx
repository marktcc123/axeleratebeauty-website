import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/site/PageIntro";
import { formatMoney } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function BillingPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const supabase = await createServerSupabase();
  const { data: orders } = supabase && session.organizationId
    ? await supabase
        .from("orders")
        .select("id, order_number, order_kind, payment_status, total_cents, created_at, location_id")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
    : { data: [] };

  const allowed = new Set(session.locations.map((location) => location.id));
  const visible = (orders ?? []).filter((order) => !order.location_id || allowed.has(order.location_id));
  const replenishment = visible.filter((order) => order.order_kind !== "contract_installment");
  const installments = visible.filter((order) => order.order_kind === "contract_installment");

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <PageIntro eyebrow="Billing" title="Payments for orders and contract installments.">
          <p>Replenishment orders and contract installment payments are listed separately. Opening a confirmation page does not prove a payment succeeded.</p>
        </PageIntro>
        <div className="mt-12">
          <h2 className="font-serif text-3xl text-ink">Replenishment orders</h2>
          {!replenishment.length ? (
            <p className="mt-4 text-sm text-muted">No replenishment payments yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {replenishment.map((order) => (
                <li key={order.id} className="border border-sand-200 bg-white p-4 text-sm">
                  {order.order_number} · {order.payment_status} · {formatMoney(order.total_cents)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-12">
          <h2 className="font-serif text-3xl text-ink">Contract installment payments</h2>
          <p className="mt-2 text-sm text-muted">
            Scheduled contract payments stay on the original agreement. They are not created as extra product sales.
          </p>
          {!installments.length ? (
            <p className="mt-4 text-sm text-muted">No contract installment payments are on file for this account.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {installments.map((order) => (
                <li key={order.id} className="border border-sand-200 bg-white p-4 text-sm">
                  {order.order_number} · {order.payment_status} · {formatMoney(order.total_cents)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link href="/partner/support" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">
          Request a refund, cancellation, or after-sales review
        </Link>
      </div>
    </section>
  );
}
