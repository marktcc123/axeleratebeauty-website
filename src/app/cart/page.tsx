import Link from "next/link";
import { removeCartItem, updateCartItem } from "@/app/actions/cart";
import { startCheckoutForm } from "@/app/actions/checkout";
import { LocationSelect } from "@/components/commerce/LocationSelect";
import { PageIntro } from "@/components/site/PageIntro";
import { readCart } from "@/lib/cart-cookie";
import { getAuthorizedProductsByIds } from "@/lib/catalog";
import { formatMoney, formatPendingMoney } from "@/lib/commerce/guards";
import { isStripeCheckoutReady } from "@/lib/config";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function CartPage() {
  const [cart, session] = await Promise.all([readCart(), getSession()]);
  const products = await getAuthorizedProductsByIds(cart.items.map((item) => item.productId), session);
  const lines = cart.items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return { item, product };
  });
  const displayable = lines.filter((line) => line.product?.publicationStatus === "active");
  const priced = displayable.filter((line) => line.product?.professionalPriceCents != null);
  const missingPrice = displayable.some((line) => line.product?.professionalPriceCents == null);
  const outOfStock = displayable.some((line) => line.product?.inventoryStatus === "out_of_stock");
  const subtotal = priced.reduce((sum, line) => sum + (line.product?.professionalPriceCents ?? 0) * line.item.quantity, 0);
  const activeStore = session.locations.find((location) => location.id === session.activeLocationId);

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <PageIntro eyebrow="Cart" title="Review your professional order." />
        <div className="mt-8">
          <LocationSelect locations={session.locations} activeLocationId={session.activeLocationId} />
        </div>
        {displayable.length === 0 ? (
          <p className="mt-10 text-muted">Your cart is empty. Published products can be added after account approval.</p>
        ) : (
          <div className="mt-10 space-y-6">
            {displayable.map(({ item, product }) => (
              <div key={item.productId} className="flex flex-col gap-3 border-b border-sand-200 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-serif text-xl text-ink">{product?.name}</p>
                  <p className="text-sm text-muted">{product?.sku}</p>
                  <p className="text-sm text-stone-deep">
                    {product?.professionalPriceCents != null
                      ? formatMoney(product.professionalPriceCents)
                      : "Authorized price is not available for the selected store."}
                  </p>
                  {product?.inventoryStatus === "out_of_stock" && (
                    <p className="text-sm text-accent-tac">Currently unavailable.</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <form action={async () => {
                    "use server";
                    await updateCartItem(item.productId, item.quantity - 1);
                  }}>
                    <button className="border border-sand-200 px-3 py-1" aria-label="Decrease quantity">-</button>
                  </form>
                  <span>{item.quantity}</span>
                  <form action={async () => {
                    "use server";
                    await updateCartItem(item.productId, item.quantity + 1);
                  }}>
                    <button className="border border-sand-200 px-3 py-1" aria-label="Increase quantity">+</button>
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
            <div className="space-y-2 text-sm text-stone-deep">
              <p>Merchandise {missingPrice ? "incomplete" : formatMoney(subtotal)}</p>
              <p>Shipping {formatPendingMoney(null, true)}</p>
              <p>Tax {formatPendingMoney(null, true)}</p>
              <p>Total {formatPendingMoney(null, true)}</p>
              {activeStore && (
                <p>Ship to {activeStore.name}{activeStore.city ? ` · ${activeStore.city}` : ""}{activeStore.state ? `, ${activeStore.state}` : ""}</p>
              )}
            </div>
            {missingPrice && <p className="text-sm text-muted">Checkout stays locked until every item has an authorized store price.</p>}
            {outOfStock && <p className="text-sm text-muted">Remove unavailable items before checkout.</p>}
            {!canPurchase(session) ? (
              <Link href="/partner/login" className="inline-block bg-charcoal px-6 py-3 text-sm text-cream">Sign in with an approved account</Link>
            ) : !isStripeCheckoutReady() ? (
              <p className="text-sm text-muted">Checkout stays locked until Stripe tax and a shipping rate are configured. Unknown shipping or tax is never treated as free.</p>
            ) : missingPrice || outOfStock ? (
              <p className="text-sm text-muted">Payment cannot start until prices and availability are confirmed.</p>
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
