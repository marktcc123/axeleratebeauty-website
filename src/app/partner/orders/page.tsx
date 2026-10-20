import Link from "next/link";
import { redirect } from "next/navigation";
import { CommerceHeader, CommercePage } from "@/components/commerce/CommercePage";
import { ReorderButton } from "@/components/commerce/ReorderButton";
import { StatusBadge } from "@/components/commerce/StatusBadge";
import { CatalogError, getAuthorizedProductsByIds } from "@/lib/catalog";
import { formatMoney, formatPendingMoney } from "@/lib/commerce/guards";
import { classifyOrderList, PARTNER_ORDERS_SELECT } from "@/lib/commerce/order-access";
import { logOrderEvent } from "@/lib/commerce/order-log";
import { orderMoneyPresentation } from "@/lib/commerce/order-money";
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
  total_cents: number;
  refunded_cents: number | null;
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ showFailed?: string }>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const { showFailed } = await searchParams;
  const includeFailed = showFailed === "1";

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

  const authorized = classified.orders.filter((order) => !order.location_id || locationIds.includes(order.location_id));
  const failedCount = authorized.filter((order) => order.payment_status === "failed").length;
  // Hide failed checkout noise only. Keep pending, paid, processing, and refunded orders.
  const visible = includeFailed
    ? authorized
    : authorized.filter((order) => order.payment_status !== "failed");
  const productIds = [
    ...new Set(
      visible.flatMap((order) => (order.order_items ?? []).map((item) => item.product_id).filter((id): id is string => Boolean(id))),
    ),
  ];
  let reorderById = new Map<string, { slug: string; reorderEligible: boolean }>();
  try {
    const catalog = await getAuthorizedProductsByIds(productIds, session);
    reorderById = new Map(
      catalog
        .filter(
          (product) =>
            product.publicationStatus === "active" && product.reorderEligible && product.professionalPriceCents != null,
        )
        .map((product) => [product.id, { slug: product.slug, reorderEligible: product.reorderEligible }]),
    );
  } catch (error) {
    logOrderEvent({
      stage: "orders_list",
      code: error instanceof CatalogError ? "catalog_lookup_failed" : "catalog_unavailable",
      organizationId: session.organizationId,
    });
  }

  const storeName = (locationId: string | null) => {
    if (!locationId) return "Store not recorded";
    const location = session.locations.find((entry) => entry.id === locationId);
    if (!location) return "Unauthorized or unknown store";
    return `${location.name}${location.city ? ` · ${location.city}` : ""}`;
  };

  return (
    <CommercePage>
      <CommerceHeader
        eyebrow="Orders"
        title="Your orders"
        description="View your orders and payment status. Reorders use current prices and availability."
      />
      {failedCount > 0 ? (
        <p className="mt-4 text-sm text-muted">
          {includeFailed ? (
            <>
              Showing unsuccessful checkout attempts.{" "}
              <Link href="/partner/orders" className="underline-offset-4 hover:underline">
                Hide unsuccessful attempts
              </Link>
            </>
          ) : (
            <>
              {failedCount} unsuccessful checkout attempt{failedCount === 1 ? "" : "s"} hidden.{" "}
              <Link href="/partner/orders?showFailed=1" className="underline-offset-4 hover:underline">
                Show unsuccessful attempts
              </Link>
            </>
          )}
        </p>
      ) : null}

      {classified.status === "error" ? (
        <p className="mt-10 text-sm text-accent-tac" role="alert">
          Orders could not be loaded. Please try again shortly.
        </p>
      ) : classified.status === "empty" || (visible.length === 0 && authorized.length === 0) ? (
        <p className="mt-10 text-muted">No orders yet. Confirmed orders appear here after checkout.</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-muted">
          No open or completed orders to show.
          {failedCount > 0 ? (
            <>
              {" "}
              <Link href="/partner/orders?showFailed=1" className="underline-offset-4 hover:underline">
                Show {failedCount} unsuccessful attempt{failedCount === 1 ? "" : "s"}
              </Link>
            </>
          ) : null}
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {visible.map((order) => {
            const money = orderMoneyPresentation(order);
            return (
              <article key={order.id} className="border border-sand-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-all font-serif text-2xl text-ink">{order.order_number}</p>
                    <p className="mt-1 text-sm text-muted">
                      {new Date(order.created_at).toLocaleDateString()} · {storeName(order.location_id)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={order.payment_status} />
                    <StatusBadge value={order.fulfillment_status} />
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted">
                  {order.order_kind === "contract_installment" ? "Contract payment" : "Replenishment"}
                </p>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="text-muted">Merchandise</dt>
                    <dd className="tabular-nums text-stone-deep">{formatMoney(money.merchandiseCents)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Shipping</dt>
                    <dd className="tabular-nums text-stone-deep">
                      {formatPendingMoney(money.shippingCents, money.shippingPending)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Tax</dt>
                    <dd className="tabular-nums text-stone-deep">
                      {formatPendingMoney(money.taxCents, money.taxPending)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">{money.orderTotalCaption}</dt>
                    <dd className="tabular-nums font-medium text-stone-deep">{formatMoney(money.orderTotalCents)}</dd>
                  </div>
                  {money.showPaidAmount && money.paidCents != null ? (
                    <div>
                      <dt className="text-muted">{money.paidCaption}</dt>
                      <dd className="tabular-nums text-stone-deep">{formatMoney(money.paidCents)}</dd>
                    </div>
                  ) : null}
                  {money.showRefunded && money.refundedCents != null ? (
                    <div>
                      <dt className="text-muted">Refunded</dt>
                      <dd className="tabular-nums text-stone-deep">{formatMoney(money.refundedCents)}</dd>
                    </div>
                  ) : null}
                  {money.showNetPaid && money.netPaidCents != null ? (
                    <div>
                      <dt className="text-muted">Net paid</dt>
                      <dd className="tabular-nums font-medium text-stone-deep">{formatMoney(money.netPaidCents)}</dd>
                    </div>
                  ) : null}
                </dl>

                {order.tracking_number ? (
                  <p className="mt-3 break-all text-sm">Tracking: {order.tracking_number}</p>
                ) : null}

                <ul className="mt-4 space-y-2 border-t border-sand-200 pt-4 text-sm">
                  {(order.order_items ?? []).map((item) => {
                    const reorder = item.product_id ? reorderById.get(item.product_id) : null;
                    return (
                      <li
                        key={`${order.id}-${item.sku}-${item.product_id ?? "snapshot"}`}
                        className="flex flex-wrap items-baseline justify-between gap-2"
                      >
                        <span className="min-w-0 text-stone-deep">
                          <span className="break-words">{item.name}</span>
                          <span className="text-muted">
                            {" "}
                            · {item.quantity} · {item.sku} · was {formatMoney(item.unit_price_cents)}
                          </span>
                        </span>
                        {reorder && order.order_kind !== "contract_installment" && item.product_id ? (
                          <ReorderButton productId={item.product_id} />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      <Link href="/partner/catalog" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">
        Back to catalog
      </Link>
    </CommercePage>
  );
}
