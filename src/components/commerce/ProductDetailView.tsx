import Link from "next/link";
import { ProductBuyBox } from "@/components/commerce/ProductBuyBox";
import { contentEntryForProduct, type ProductResource } from "@/data/brand-content";
import type { CatalogDetailVariant } from "@/lib/catalog-browse";
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

function variantsFromProduct(product: Product): CatalogDetailVariant[] {
  const raw = product.shippingAttributes?.variants;
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      {
        id: product.id,
        packLabel: product.packLabel,
        barcode: typeof product.shippingAttributes?.barcode === "string" ? product.shippingAttributes.barcode : null,
        images: product.images,
        comingSoon: product.shippingAttributes?.comingSoon === true,
      },
    ];
  }
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return [
      {
        id: typeof row.id === "string" ? row.id : `${product.id}-${index}`,
        packLabel: typeof row.packLabel === "string" ? row.packLabel : null,
        packSpecRaw: typeof row.packSpecRaw === "string" ? row.packSpecRaw : null,
        barcode: typeof row.barcode === "string" ? row.barcode : null,
        images: Array.isArray(row.images) ? row.images.filter((src): src is string => typeof src === "string") : [],
        comingSoon: row.comingSoon === true,
      } satisfies CatalogDetailVariant,
    ];
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
  const variants = variantsFromProduct(product);
  const entry = contentEntryForProduct(product);
  const resources = [...brandResources, ...resourcesFromShipping(product)].filter(
    (resource, index, list) => list.findIndex((item) => item.href === resource.href) === index,
  );

  return (
    <>
      <ProductBuyBox product={product} variants={variants} approved={approved} backHref={backHref} />

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
