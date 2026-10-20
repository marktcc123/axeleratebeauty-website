import Link from "next/link";
import { redirect } from "next/navigation";
import { LocationSelect } from "@/components/commerce/LocationSelect";
import { ReorderButton } from "@/components/commerce/ReorderButton";
import { PageIntro } from "@/components/site/PageIntro";
import { CatalogError, getAuthorizedProductsByIds } from "@/lib/catalog";
import { formatMoney, formatPendingMoney } from "@/lib/commerce/guards";
import { classifyOrderList, PARTNER_ORDERS_SELECT } from "@/lib/commerce/order-access";
import { logOrderEvent } from "@/lib/commerce/order-log";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

type OrderItemSnapshot = {
  name: string;
  quantity: number;
  sku: string;
  product_id: string | null;
  unit_price_cents: number;
};

type PartnerOrder = {
  id: string;
  order_number: string;
  created_at: string;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  tax_pending: boolean | null;
  shipping_pending: boolean | null;
  payment_status: string;
  fulfillment_status: string;
  status: string;
  tracking_number: string | null;
  order_kind: string;
  location_id: string | null;
  order_items: OrderItemSnapshot[] | null;
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");

  const supabase = await createServerSupabase();
  const locationIds = session.locations.map((location) => location.id);
  const query = supabase && session.organizationId
    ? supabase
        .from("orders")
        .select(PARTNER_ORDERS_SELECT)
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
    : null;
  const result = query
    ? await query
    : { data: [] as PartnerOrder[] | null, error: { code: "not_configured", message: "Orders are not configured." } };

  const classified = classifyOrderList({
    configured: Boolean(supabase && session.organizationId),
    error: result.error,
    data: (result.data ?? null) as PartnerOrder[] | null,
  });

  if (classified.status === "error") {
    logOrderEvent({
      stage: "orders_list",
      code: result.error?.code ?? "orders_query_failed",
      organizationId: session.organizationId,
    });
  }

  const visible = classified.orders.filter((order) => !order.location_id || locationIds.includes(order.location_id));
  const productIds = [...new Set(visible.flatMap((order) => (order.order_items ?? []).map((item) => item.product_id).filter((id): id is string => Boolean(id))))];
  let reorderById = new Map<string, { slug: string; reorderEligible: boolean }>();
  try {
    const catalog = await getAuthorizedProductsByIds(productIds, session);
    reorderById = new Map(
      catalog
        .filter((product) => product.publicationStatus === "active" && product.reorderEligible && product.professionalPriceCents != null)
        .map((product) => [product.id, { slug: product.slug, reorderEligible: product.reorderEligible }]),
    );
  } catch (error) {
    logOrderEvent({
      stage: "orders_list",
      code: error instanceof CatalogError ? "catalog_lookup_failed" : "catalog_unavailable",
      organizationId: session.organizationId,
    });
  }

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageIntro eyebrow="Orders" title="Your business order history." />
        <div className="mt-6">
          <LocationSelect locations={session.locations} activeLocationId={session.activeLocationId} />
        </div>
        {classified.status === "error" ? (
          <p className="mt-10 text-sm text-accent-tac" role="alert">Orders could not be loaded. Try again in a moment.</p>
        ) : classified.status === "empty" || visible.length === 0 ? (
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
                  Merchandise {formatMoney(order.subtotal_cents)} · Shipping {formatPendingMoney(order.shipping_cents, Boolean(order.shipping_pending))} · Tax {formatPendingMoney(order.tax_cents, Boolean(order.tax_pending))}
                </p>
                {order.tracking_number && <p className="mt-1 text-sm">Tracking: {order.tracking_number}</p>}
                <ul className="mt-4 space-y-1 text-sm text-muted">
                  {(order.order_items ?? []).map((item) => (
                    <li key={`${order.id}-${item.sku}-${item.product_id ?? "snapshot"}`}>
                      {item.name} · {item.quantity} · {item.sku}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  {(order.order_items ?? []).map((item) => {
                    const reorder = item.product_id ? reorderById.get(item.product_id) : null;
                    if (!reorder || order.order_kind === "contract_installment" || !item.product_id) return null;
                    return <ReorderButton key={`${order.id}-${item.product_id}`} productId={item.product_id} />;
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
