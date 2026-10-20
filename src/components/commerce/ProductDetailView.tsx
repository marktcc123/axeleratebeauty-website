import Link from "next/link";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductImage } from "@/components/commerce/ProductImage";
import { authorizedPriceLabel, publicPriceLabel } from "@/lib/commerce/guards";
import {
  inventoryCustomerLabel,
  productPackLabel,
  productPrimaryImage,
  productUnitLabel,
} from "@/lib/commerce/product-presentation";
import type { Product } from "@/lib/types";

export function ProductDetailView({
  product,
  approved,
  related,
  backHref,
}: {
  product: Product;
  approved: boolean;
  related: Product[];
  backHref?: string;
}) {
  const primary = productPrimaryImage(product);
  const gallery = product.images.filter((src) => typeof src === "string" && src.trim()).map((src) => src.trim());
  const pack = productPackLabel(product);
  const unit = productUnitLabel(product);
  const stock = inventoryCustomerLabel(product.inventoryStatus);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
        <div className="space-y-3">
          <ProductImage
            src={primary}
            alt={product.name}
            sizes="(max-width: 1024px) 100vw, 560px"
            priority
            className="max-w-xl"
          />
          {gallery.length > 1 ? (
            <ul className="grid grid-cols-4 gap-2 sm:max-w-xl">
              {gallery.slice(0, 4).map((src) => (
                <li key={src}>
                  <ProductImage src={src} alt="" sizes="120px" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="commerce-eyebrow">{product.category.replaceAll("_", " ")}</p>
          <h1 className="commerce-title mt-2 text-balance">{product.name}</h1>
          <p className="commerce-meta mt-3">SKU {product.sku}</p>
          {pack ? <p className="mt-2 text-sm text-stone-deep">{pack}</p> : null}
          {unit ? <p className="commerce-meta mt-1">Sold {unit}</p> : null}

          {approved ? (
            <p className="mt-6 text-xs uppercase tracking-[0.12em] text-muted">Your price</p>
          ) : null}
          <p className={`commerce-price ${approved ? "mt-1" : "mt-6"}`}>
            {approved ? authorizedPriceLabel(product) : publicPriceLabel(product)}
          </p>
          {stock ? <p className="commerce-meta mt-2">{stock}</p> : null}

          <div className="mt-8">
            {approved && product.professionalPriceCents != null ? (
              <AddToCartButton productId={product.id} allowQuantity productName={product.name} />
            ) : approved ? (
              <p className="text-sm text-muted">
                No valid price for this location. Purchasing stays locked until a price is assigned.
              </p>
            ) : (
              <Link href="/partner/login" className="commerce-btn inline-flex">
                Sign in to purchase
              </Link>
            )}
          </div>

          {backHref ? (
            <Link href={backHref} className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
              Back to Shop
            </Link>
          ) : null}
        </div>
      </div>

      {product.description?.trim() ? (
        <details className="mt-12 border-t border-sand-200 pt-8">
          <summary className="cursor-pointer font-serif text-xl text-ink">Product details</summary>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-muted">{product.description.trim()}</p>
        </details>
      ) : null}

      <div className="mt-16 grid gap-10 border-t border-sand-200 pt-12 md:grid-cols-2">
        {product.intendedUse?.trim() ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Professional use</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.intendedUse.trim()}</p>
          </section>
        ) : null}

        {product.contents.length > 0 ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Package contents</h2>
            <ul className="mt-3 space-y-2 text-muted">
              {product.contents.map((item) => (
                <li key={`${item.sku ?? ""}-${item.name}`}>
                  {item.name}
                  {item.quantity ? ` · ${item.quantity}` : ""}
                  {item.sku ? ` · ${item.sku}` : ""}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {product.usageNotes?.trim() ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Usage</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.usageNotes.trim()}</p>
          </section>
        ) : null}

        {product.precautions?.trim() ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Precautions</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.precautions.trim()}</p>
          </section>
        ) : null}

        {product.highlights.length > 0 ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              {product.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {related.length > 0 ? (
        <div className="mt-16 border-t border-sand-200 pt-12">
          <h2 className="font-serif text-2xl text-ink">Related products</h2>
          <ul className="mt-4 space-y-2">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={approved ? `/partner/catalog/${item.slug}` : `/professional-kits/${item.slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
