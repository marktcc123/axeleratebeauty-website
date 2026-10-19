import Link from "next/link";
import { redirect } from "next/navigation";
import { ReorderButton } from "@/components/commerce/ReorderButton";
import { PageIntro } from "@/components/site/PageIntro";
import { formatMoney } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const supabase = await createServerSupabase();
  const { data: orders } = supabase && session.organizationId
    ? await supabase
        .from("orders")
        .select("id, order_number, created_at, total_cents, payment_status, fulfillment_status, status, tracking_number, order_items(name, quantity, sku, product_id, products(slug))")
        .eq("organization_id", session.organizationId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageIntro eyebrow="Orders" title="Your business order history." />
        {!orders?.length ? (
          <p className="mt-10 text-muted">No orders yet. Paid orders appear here after Stripe confirms payment.</p>
        ) : (
          <div className="mt-10 space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="border border-sand-200 bg-white p-6">
                <div className="flex flex-wrap justify-between gap-3">
                  <p className="font-serif text-2xl text-ink">{order.order_number}</p>
                  <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {order.payment_status} · {order.fulfillment_status} · {formatMoney(order.total_cents)}
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
                    if (!product?.slug) return null;
                    return <ReorderButton key={item.sku} slug={product.slug} />;
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
          <Link href="/professional-programs" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">
          Browse Professional Programs
        </Link>
      </div>
    </section>
  );
}
