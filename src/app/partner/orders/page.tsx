import Link from "next/link";
import { redirect } from "next/navigation";
import { LocationSelect } from "@/components/commerce/LocationSelect";
import { ReorderButton } from "@/components/commerce/ReorderButton";
import { PageIntro } from "@/components/site/PageIntro";
import { formatMoney, formatPendingMoney } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const supabase = await createServerSupabase();
  const locationIds = session.locations.map((location) => location.id);
  const query = supabase && session.organizationId
    ? supabase
        .from("orders")
        .select("id, order_number, created_at, total_cents, tax_cents, shipping_cents, tax_pending, shipping_pending, payment_status, fulfillment_status, status, tracking_number, order_kind, location_id, order_items(name, quantity, sku, product_id, unit_price_cents, products(slug))")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
    : null;
  const { data: orders } = query ? await query : { data: [] };
  const visible = (orders ?? []).filter((order) => !order.location_id || locationIds.includes(order.location_id));

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageIntro eyebrow="Orders" title="Your business order history." />
        <div className="mt-6">
          <LocationSelect locations={session.locations} activeLocationId={session.activeLocationId} />
        </div>
        {!visible.length ? (
          <p className="mt-10 text-muted">No orders yet. Paid orders appear here after payment is confirmed.</p>
        ) : (
          <div className="mt-10 space-y-6 overflow-x-auto">
            {visible.map((order) => (
              <article key={order.id} className="min-w-[20rem] border border-sand-200 bg-white p-6">
                <div className="flex flex-wrap justify-between gap-3">
                  <p className="font-serif text-2xl text-ink">{order.order_number}</p>
                  <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {order.order_kind === "contract_installment" ? "Contract payment" : "Replenishment order"} · {order.payment_status} · {order.fulfillment_status}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Merchandise {formatMoney(order.total_cents)} · Shipping {formatPendingMoney(order.shipping_cents, Boolean(order.shipping_pending))} · Tax {formatPendingMoney(order.tax_cents, Boolean(order.tax_pending))}
                </p>
                {order.tracking_number && <p className="mt-1 text-sm">Tracking: {order.tracking_number}</p>}
                <ul className="mt-4 space-y-1 text-sm text-muted">
                  {order.order_items?.map((item) => (
                    <li key={`${order.id}-${item.sku}`}>
                      {item.name} · {item.quantity} · {item.sku}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  {order.order_items?.map((item) => {
                    const product = Array.isArray(item.products) ? item.products[0] : item.products;
                    if (!product?.slug || order.order_kind === "contract_installment") return null;
                    return <ReorderButton key={item.sku} slug={product.slug} />;
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
        <Link href="/partner/catalog" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">
          Browse replenishment catalog
        </Link>
      </div>
    </section>
  );
}
