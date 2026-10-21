import Link from "next/link";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductImage } from "@/components/commerce/ProductImage";
import { contentEntryForProduct, type ProductResource } from "@/data/brand-content";
import { authorizedPriceLabel, publicPriceLabel } from "@/lib/commerce/guards";
import {
  inventoryCustomerLabel,
  productPackLabel,
  productPrimaryImage,
  productUnitLabel,
} from "@/lib/commerce/product-presentation";
import type { Product } from "@/lib/types";

function resourcesFromShipping(product: Product): ProductResource[] {
  const raw = product.shippingAttributes?.resources;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const href = typeof row.href === "string" ? row.href.trim() : "";
    const label = typeof row.label === "string" ? row.label.trim() : "";
    if (!href || !label) return [];
    const locale = row.locale === "en" || !row.locale ? "en" : null;
    if (!locale) return [];
    const kind = row.kind === "pdf" ? "pdf" : "guide";
    return [{ label, href, locale, kind } satisfies ProductResource];
  });
}

export function ProductDetailView({
  product,
  approved,
  related,
  backHref,
  brandResources = [],
}: {
  product: Product;
  approved: boolean;
  related: Product[];
  backHref?: string;
  brandResources?: ProductResource[];
}) {
  const primary = productPrimaryImage(product);
  const gallery = product.images.filter((src) => typeof src === "string" && src.trim()).map((src) => src.trim());
  const pack = productPackLabel(product);
  const unit = productUnitLabel(product);
  const stock = inventoryCustomerLabel(product.inventoryStatus);
  const entry = contentEntryForProduct(product);
  const resources = [...brandResources, ...resourcesFromShipping(product)].filter(
    (resource, index, list) => list.findIndex((item) => item.href === resource.href) === index,
  );

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
          <h1 className="commerce-title text-balance">{product.name}</h1>
          {pack ? <p className="mt-3 text-sm text-stone-deep">{pack}</p> : null}
          {unit ? <p className="commerce-meta mt-1">Sold {unit}</p> : null}
          <p className="commerce-meta mt-3">SKU {product.sku}</p>

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

      {product.shortDescription?.trim() || product.description?.trim() ? (
        <section className="mt-14 border-t border-sand-200 pt-10">
          <h2 className="font-serif text-2xl text-ink">Overview</h2>
          {product.shortDescription?.trim() ? (
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.shortDescription.trim()}</p>
          ) : null}
          {product.description?.trim() &&
          product.description.trim() !== product.shortDescription?.trim() ? (
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.description.trim()}</p>
          ) : null}
        </section>
      ) : null}

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        {product.intendedUse?.trim() || product.contents.length > 0 ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Product details</h2>
            {product.intendedUse?.trim() ? (
              <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.intendedUse.trim()}</p>
            ) : null}
            {product.contents.length > 0 ? (
              <ul className="mt-3 space-y-2 text-muted">
                {product.contents.map((item) => (
                  <li key={`${item.sku ?? ""}-${item.name}`}>
                    {item.name}
                    {item.quantity ? ` · ${item.quantity}` : ""}
                    {item.sku ? ` · ${item.sku}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        {product.usageNotes?.trim() ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">How to use</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.usageNotes.trim()}</p>
          </section>
        ) : null}

        {typeof product.shippingAttributes.ingredients === "string" &&
        product.shippingAttributes.ingredients.trim() ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Ingredients</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">
              {product.shippingAttributes.ingredients.trim()}
            </p>
          </section>
        ) : product.highlights.length > 0 ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              {product.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {product.precautions?.trim() ? (
          <section>
            <h2 className="font-serif text-2xl text-ink">Precautions</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-muted">{product.precautions.trim()}</p>
          </section>
        ) : null}
      </div>

      {resources.length > 0 ? (
        <section className="mt-12 border-t border-sand-200 pt-10">
          <h2 className="font-serif text-2xl text-ink">Professional resources</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {resources.map((resource) => (
              <li key={resource.href}>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {resource.kind === "pdf" ? "Download PDF" : resource.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : entry?.matchStatus === "pending_size_verify" ? (
        <p className="mt-12 border-t border-sand-200 pt-8 text-sm text-muted">
          Official English product materials are recorded for operator review. They stay hidden until
          packaging size is confirmed for this SKU.
        </p>
      ) : null}

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
