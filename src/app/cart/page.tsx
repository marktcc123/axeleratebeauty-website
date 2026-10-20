import Link from "next/link";
import { CartEditor } from "@/components/commerce/CartEditor";
import { PartnerChrome } from "@/components/commerce/PartnerChrome";
import { readCart } from "@/lib/cart-cookie";
import { getAuthorizedProductsByIds } from "@/lib/catalog";
import { isStripeCheckoutReady } from "@/lib/config";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function CartPage() {
  const [cart, session] = await Promise.all([readCart(), getSession()]);
  const products = await getAuthorizedProductsByIds(
    cart.items.map((item) => item.productId),
    session,
  );
  const lines = cart.items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product || product.publicationStatus !== "active") return [];
    return [
      {
        productId: item.productId,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPriceCents: product.professionalPriceCents,
        outOfStock: product.inventoryStatus === "out_of_stock",
      },
    ];
  });
  const activeStore = session.locations.find((location) => location.id === session.activeLocationId);

  return (
    <>
      {session.userId ? <PartnerChrome session={session} /> : null}
      <section className="bg-cream px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <header>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Cart</p>
            <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Review before checkout</h1>
          </header>

          {activeStore ? (
            <div className="mt-6 space-y-1 text-sm text-stone-deep">
              <p>
                Ordering for <strong>{activeStore.name}</strong>
                {activeStore.city ? ` · ${activeStore.city}` : ""}
                {activeStore.state ? `, ${activeStore.state}` : ""}
              </p>
              <p className="text-muted">
                Stripe Checkout collects the delivery address. Store name and city are not a complete shipping address.
              </p>
            </div>
          ) : null}

          <CartEditor
            lines={lines}
            checkoutReady={isStripeCheckoutReady()}
            canCheckout={canPurchase(session)}
          />
          <Link href="/partner/catalog" className="mt-8 inline-block text-sm underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </div>
      </section>
    </>
  );
}
