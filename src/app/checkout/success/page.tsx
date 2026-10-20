import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutReturn } from "@/components/commerce/CheckoutReturn";
import { PageIntro } from "@/components/site/PageIntro";
import { asCheckoutReturnOrder, CHECKOUT_RETURN_SELECT, checkoutReturnKind, checkoutReturnTitle } from "@/lib/commerce/order-access";
import { logOrderEvent } from "@/lib/commerce/order-log";
import { getSession } from "@/lib/session";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");

  const supabase = await createServerSupabase();
  const lookup = supabase && orderNumber
    ? await supabase.from("orders").select(CHECKOUT_RETURN_SELECT).eq("order_number", orderNumber).maybeSingle()
    : { data: null, error: supabase ? null : { code: "not_configured" } };

  const order = asCheckoutReturnOrder(lookup.data);
  const kind = checkoutReturnKind({
    queryError: Boolean(lookup.error) || !supabase,
    order,
    session,
  });

  if (kind === "query_failed") {
    logOrderEvent({
      stage: "order_status",
      code: lookup.error?.code ?? "order_status_failed",
      orderNumber: orderNumber ?? null,
      organizationId: session.organizationId,
    });
  } else if (kind === "missing") {
    logOrderEvent({
      stage: "order_status",
      code: "not_found",
      orderNumber: orderNumber ?? null,
      organizationId: session.organizationId,
    });
  } else if (order) {
    logOrderEvent({
      stage: "order_status",
      code: kind,
      orderId: order.id,
      orderNumber: order.order_number,
      organizationId: session.organizationId,
    });
  }

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-xl">
        <PageIntro eyebrow="Checkout" title={checkoutReturnTitle(kind)} />
        <CheckoutReturn kind={kind} orderNumber={order?.order_number ?? orderNumber ?? null} />
        <Link href="/partner/orders" className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
          View order history
        </Link>
      </div>
    </section>
  );
}
