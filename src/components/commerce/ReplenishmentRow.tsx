"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/app/actions/cart";
import { ProductImage } from "@/components/commerce/ProductImage";
import { QtyControl } from "@/components/commerce/QtyControl";
import { authorizedPriceLabel } from "@/lib/commerce/guards";
import {
  inventoryCustomerLabel,
  productListBlurb,
  productPrimaryImage,
  productSpecLine,
} from "@/lib/commerce/product-presentation";
import type { Product } from "@/lib/types";
import { replenishmentRowState } from "./replenishment-row-state";

export function ReplenishmentRow({ product }: { product: Product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { unavailable, canAdd, stockHint } = replenishmentRowState(product);
  const image = productPrimaryImage(product);
  const detailHref = `/partner/catalog/${product.slug}`;
  const blurb = productListBlurb(product);
  const stock = inventoryCustomerLabel(product.inventoryStatus);

  return (
    <article className="commerce-row">
      <Link href={detailHref} className="block w-20 shrink-0 sm:w-auto">
        <ProductImage src={image} alt={product.name} sizes="80px" />
      </Link>

      <div className="min-w-0">
        <h2 className="break-words font-serif text-xl leading-snug text-ink sm:text-2xl">
          <Link href={detailHref} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        <p className="commerce-meta mt-1">{productSpecLine(product)}</p>
        {blurb ? <p className="mt-2 text-sm leading-relaxed text-muted">{blurb}</p> : null}
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">Your price</p>
        <p className="commerce-price">{authorizedPriceLabel(product)}</p>
        {stock && !unavailable ? <p className="commerce-meta mt-1">{stock}</p> : null}
        {stockHint ? (
          <p className={`mt-1 text-sm ${unavailable ? "text-accent-tac" : "text-muted"}`}>{stockHint}</p>
        ) : null}
        {message ? (
          <p className="mt-2 text-sm text-muted" role="status">
            {message}{" "}
            <Link href="/cart" className="underline underline-offset-4">
              View cart
            </Link>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <QtyControl
          label={product.name}
          value={qty}
          disabled={!canAdd || pending}
          onChange={setQty}
        />
        <button
          type="button"
          disabled={!canAdd || pending}
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
    </article>
  );
}
