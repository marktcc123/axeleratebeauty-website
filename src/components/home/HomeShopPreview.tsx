import Link from "next/link";
import { ProductImage } from "@/components/commerce/ProductImage";
import { authorizedPriceLabel, publicPriceLabel } from "@/lib/commerce/guards";
import { productCardSpecLine, productPrimaryImage } from "@/lib/commerce/product-presentation";
import { canPurchase, type Product, type SessionContext } from "@/lib/types";

export function HomeShopPreview({
  products,
  session,
}: {
  products: Product[];
  session: SessionContext;
}) {
  const shopHref = session.userId
    ? canPurchase(session)
      ? "/partner/catalog"
      : "/partner/dashboard"
    : "/for-professionals";
  const preview = products.slice(0, 6);
  const showPrice = canPurchase(session);

  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Shop</p>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">Products for your business</h2>
            <p className="mt-3 text-muted">
              {showPrice
                ? "Your prices for the selected shipping location."
                : "Sign in to see your business price. Public pages do not show professional dollars."}
            </p>
          </div>
          <Link href={shopHref} className="text-sm underline-offset-4 hover:underline">
            {session.userId ? "Open Shop" : "Create account or sign in"}
          </Link>
        </div>

        {preview.length === 0 ? (
          <p className="mt-10 max-w-xl text-sm text-muted">
            Sellable products appear here when published for U.S. ordering. Series below are brand
            lines — not an automatic catalog of every official SKU.
          </p>
        ) : (
          <ul className="commerce-grid mt-12">
            {preview.map((product) => {
              const href = showPrice
                ? `/partner/catalog/${product.slug}`
                : `/professional-kits/${product.slug}`;
              const spec = productCardSpecLine(product);
              return (
                <li key={product.id} className="commerce-card">
                  <Link href={href} className="block">
                    <ProductImage
                      src={productPrimaryImage(product)}
                      alt={product.name}
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <h3 className="mt-4 font-serif text-xl text-ink">{product.name}</h3>
                    {spec ? <p className="commerce-meta mt-2">{spec}</p> : null}
                    <p className="commerce-price mt-3">
                      {showPrice ? authorizedPriceLabel(product) : publicPriceLabel(product)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
