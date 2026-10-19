import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
import { createServiceSupabase } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const session = await getSession();
  const service = await createServiceSupabase();
  const { data } = service && order && session.organizationId
    ? await service
        .from("orders")
        .select("order_number, payment_status, status")
        .eq("order_number", order)
        .eq("organization_id", session.organizationId)
        .maybeSingle()
    : { data: null };

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-xl">
        <PageIntro eyebrow="Checkout" title="Payment confirmation pending webhook.">
          <p>
            Reaching this page does not mark an order paid. Status updates only after Stripe
            sends a verified webhook.
          </p>
        </PageIntro>
        <p className="mt-8 text-stone-deep">
          Order {data?.order_number ?? order ?? "unknown"} · payment status: {data?.payment_status ?? "not found"}
        </p>
        <Link href="/partner/orders" className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
          View order history
        </Link>
      </div>
    </section>
  );
}
