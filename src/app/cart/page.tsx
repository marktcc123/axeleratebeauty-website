import Link from "next/link";
import { removeCartItem, updateCartItem } from "@/app/actions/cart";
import { startCheckoutForm } from "@/app/actions/checkout";
import { PageIntro } from "@/components/site/PageIntro";
import { readCart } from "@/lib/cart-cookie";
import { getProductsByIds } from "@/lib/catalog";
import { formatMoney } from "@/lib/commerce/guards";
import { isStripeConfigured } from "@/lib/config";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function CartPage() {
  const [cart, session] = await Promise.all([readCart(), getSession()]);
  const products = await getProductsByIds(cart.items.map((item) => item.productId));
  const lines = cart.items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return { item, product };
  });
  const displayable = lines.filter((line) => line.product?.publicationStatus === "active");
  const subtotal = displayable.reduce((sum, line) => sum + (line.product?.professionalPriceCents ?? 0) * line.item.quantity, 0);

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <PageIntro eyebrow="Cart" title="Review your professional order." />
        {displayable.length === 0 ? (
          <p className="mt-10 text-muted">Your cart is empty. Published products can be added after account approval.</p>
        ) : (
          <div className="mt-10 space-y-6">
            {displayable.map(({ item, product }) => (
              <div key={item.productId} className="flex flex-col gap-3 border-b border-sand-200 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-serif text-xl text-ink">{product?.name}</p>
                  <p className="text-sm text-muted">{product?.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                  <form action={async () => {
                    "use server";
                    await updateCartItem(item.productId, item.quantity - 1);
                  }}>
                    <button className="border border-sand-200 px-3 py-1">-</button>
                  </form>
                  <span>{item.quantity}</span>
                  <form action={async () => {
                    "use server";
                    await updateCartItem(item.productId, item.quantity + 1);
                  }}>
                    <button className="border border-sand-200 px-3 py-1">+</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await removeCartItem(item.productId);
                  }}>
                    <button className="text-sm underline">Remove</button>
                  </form>
                </div>
              </div>
            ))}
            <p className="text-stone-deep">Subtotal {formatMoney(subtotal)} · Shipping and tax are calculated at hosted checkout when configured.</p>
            {!canPurchase(session) ? (
              <Link href="/partner/login" className="inline-block bg-charcoal px-6 py-3 text-sm text-cream">Sign in with an approved account</Link>
            ) : !isStripeConfigured() ? (
              <p className="text-sm text-muted">Checkout is prepared, but live or sandbox Stripe credentials are not connected. No payment will be collected.</p>
            ) : (
              <form action={startCheckoutForm}>
                <button className="bg-charcoal px-6 py-3 text-sm text-cream">Checkout</button>
              </form>
            )}
          </div>
        )}
        <Link href="/professional-programs" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">Continue shopping</Link>
      </div>
    </section>
  );
}
