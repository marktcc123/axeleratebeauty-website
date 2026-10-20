"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/app/actions/cart";
import { Media } from "@/components/Media";
import type { Product } from "@/lib/types";
import { replenishmentRowState } from "./replenishment-row-state";

export function ReplenishmentRow({ product }: { product: Product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { priceLabel, unavailable, canAdd, stockHint } = replenishmentRowState(product);
  const image = product.images[0] ?? "/images/product-line.webp";
  const detailHref = `/professional-kits/${product.slug}`;

  return (
    <article className="grid gap-4 border-b border-sand-200 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center">
      <Link href={detailHref} className="block w-[4.5rem] shrink-0 bg-sand-50">
        <Media
          src={image}
          alt={product.name}
          width={144}
          height={144}
          sizes="72px"
          className="aspect-square"
          imgClassName="h-full w-full object-cover"
        />
      </Link>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{product.category.replaceAll("_", " ")}</p>
        <h2 className="mt-1 break-words font-serif text-xl text-ink sm:text-2xl">
          <Link href={detailHref} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        <p className="mt-1 break-all text-sm text-muted">SKU {product.sku}</p>
        <p className="mt-2 text-base text-stone-deep">{priceLabel}</p>
        {stockHint ? (
          <p className={`mt-1 text-sm ${unavailable ? "text-accent-tac" : "text-muted"}`}>{stockHint}</p>
        ) : null}
        {message ? (
          <p className="mt-2 text-xs text-muted" role="status">
            {message}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          type="button"
          className="min-h-10 min-w-10 border border-sand-200 disabled:opacity-50"
          aria-label={`Decrease quantity for ${product.name}`}
          disabled={!canAdd || pending || qty <= 1}
          onClick={() => setQty((value) => Math.max(1, value - 1))}
        >
          -
        </button>
        <span className="min-w-8 text-center" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          className="min-h-10 min-w-10 border border-sand-200 disabled:opacity-50"
          aria-label={`Increase quantity for ${product.name}`}
          disabled={!canAdd || pending || qty >= 99}
          onClick={() => setQty((value) => Math.min(99, value + 1))}
        >
          +
        </button>
        <button
          type="button"
          disabled={!canAdd || pending}
          className="min-h-10 bg-charcoal px-4 py-2 text-sm text-cream disabled:opacity-50"
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
            setMessage(`Added ${qty} to cart.`);
            router.refresh();
          }}
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
    </article>
  );
}
