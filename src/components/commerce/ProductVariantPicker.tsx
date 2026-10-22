"use client";

import { useMemo, useState } from "react";
import { ProductImage } from "@/components/commerce/ProductImage";

export type DetailVariant = {
  id: string;
  packLabel: string | null;
  barcode: string | null;
  images: string[];
  comingSoon?: boolean;
  packSpecRaw?: string | null;
};

export function ProductVariantPicker({
  variants,
  productName,
}: {
  variants: DetailVariant[];
  productName: string;
}) {
  const initial = variants[0]?.id ?? "";
  const [activeId, setActiveId] = useState(initial);
  const active = useMemo(
    () => variants.find((variant) => variant.id === activeId) ?? variants[0],
    [activeId, variants],
  );
  if (!active || variants.length === 0) return null;

  const image = active.images[0] ?? null;

  return (
    <div className="space-y-4">
      {variants.length > 1 ? (
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
        alt={`${productName}${active.packLabel ? ` · ${active.packLabel}` : ""}`}
        sizes="(max-width: 1024px) 100vw, 560px"
        priority
        className="max-w-xl"
      />

      <dl className="space-y-2 text-sm">
        {active.packLabel ? (
          <div>
            <dt className="text-muted">Spec</dt>
            <dd className="text-stone-deep">{active.packSpecRaw ?? active.packLabel}</dd>
          </div>
        ) : null}
        {active.barcode ? (
          <div>
            <dt className="text-muted">Barcode</dt>
            <dd className="tabular-nums text-stone-deep">{active.barcode}</dd>
          </div>
        ) : null}
        {active.comingSoon ? (
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="text-stone-deep">Coming soon</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
