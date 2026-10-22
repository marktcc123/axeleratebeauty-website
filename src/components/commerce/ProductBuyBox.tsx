"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";
import { ProductImage } from "@/components/commerce/ProductImage";
import { QtyControl } from "@/components/commerce/QtyControl";
import {
  type CatalogDetailVariant,
  variantIsPurchasable,
} from "@/lib/catalog-browse";
import { authorizedPriceLabel } from "@/lib/commerce/guards";
import type { Product } from "@/lib/types";

export function ProductBuyBox({
  product,
  variants,
  approved,
  backHref,
}: {
  product: Product;
  variants: CatalogDetailVariant[];
  approved: boolean;
  backHref?: string;
}) {
  const router = useRouter();
  const initial =
    variants.find((variant) => variantIsPurchasable(product, variant))?.id ?? variants[0]?.id ?? "";
  const [activeId, setActiveId] = useState(initial);
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const active = useMemo(
    () => variants.find((variant) => variant.id === activeId) ?? variants[0],
    [activeId, variants],
  );

  if (!active) return null;

  const canBuy = approved && variantIsPurchasable(product, active);
  const image = active.images[0] ?? product.images[0] ?? null;
  const multi = variants.length > 1;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
      <div className="min-w-0 space-y-4">
        {multi ? (
          <div>
            <p className="text-sm text-muted">Size / pack</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const selected = variant.id === active.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    className={`border px-3 py-2 text-sm ${selected ? "border-charcoal bg-charcoal text-cream" : "border-sand-200 bg-white text-stone-deep"}`}
                    onClick={() => setActiveId(variant.id)}
                  >
                    {variant.packLabel ?? "Option"}
                    {variant.comingSoon ? " · Soon" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <ProductImage
          src={image}
          alt={`${product.name}${active.packLabel ? ` · ${active.packLabel}` : ""}`}
          sizes="(max-width: 1024px) 100vw, 560px"
          priority
          className="max-w-xl"
        />
      </div>

      <div className="min-w-0">
        <h1 className="commerce-title text-balance">{product.name}</h1>
        {active.comingSoon ? (
          <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">Coming soon</p>
        ) : null}
        {active.packLabel || active.packSpecRaw ? (
          <p className="mt-3 text-sm text-stone-deep">{active.packSpecRaw ?? active.packLabel}</p>
        ) : null}
        <p className="commerce-meta mt-3">SKU {product.sku}</p>
        {active.barcode ? (
          <p className="commerce-meta mt-1 tabular-nums">Barcode {active.barcode}</p>
        ) : null}

        {canBuy ? (
          <>
            <p className="mt-6 text-xs uppercase tracking-[0.12em] text-muted">Your price</p>
            <p className="commerce-price mt-1">{authorizedPriceLabel(product)}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QtyControl label={product.name} value={qty} disabled={pending} onChange={setQty} />
              <button
                type="button"
                disabled={pending}
                className="commerce-btn"
                onClick={async () => {
                  setPending(true);
                  setMessage(null);
                  const result = await addToCart(product.id, qty);
                  setPending(false);
                  if (result.redirectTo) {
                    router.push(result.redirectTo);
                    return;
                  }
                  if (result.error) {
                    setMessage(result.error);
                    return;
                  }
                  setMessage(`Added ${qty}.`);
                  router.refresh();
                }}
              >
                {pending ? "Adding…" : "Add to cart"}
              </button>
            </div>
            {message ? (
              <p className="mt-2 text-sm text-muted" role="status">
                {message}{" "}
                <Link href="/cart" className="underline underline-offset-4">
                  View cart
                </Link>
              </p>
            ) : null}
            {backHref ? (
              <Link href={backHref} className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
                Back to Shop
              </Link>
            ) : null}
          </>
        ) : (
          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted">Online ordering coming soon</p>
            <Link href={backHref ?? "/partner/catalog"} className="commerce-btn inline-flex">
              Back to Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
