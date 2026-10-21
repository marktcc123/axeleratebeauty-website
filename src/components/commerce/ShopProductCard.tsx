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
  productCardSpecLine,
  productPrimaryImage,
} from "@/lib/commerce/product-presentation";
import type { Product } from "@/lib/types";
import { replenishmentRowState } from "./replenishment-row-state";

export function ShopProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { unavailable, canAdd, stockHint } = replenishmentRowState(product);
  const image = productPrimaryImage(product);
  const detailHref = `/partner/catalog/${product.slug}`;
  const spec = productCardSpecLine(product);
  const stock = inventoryCustomerLabel(product.inventoryStatus);

  return (
    <article className="commerce-card flex h-full flex-col">
      <Link href={detailHref} className="block">
        <ProductImage src={image} alt={product.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
      </Link>

      <div className="mt-4 flex min-h-0 flex-1 flex-col text-left">
        <h2 className="font-serif text-xl leading-snug text-ink sm:text-[1.35rem]">
          <Link href={detailHref} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        {spec ? <p className="commerce-meta mt-2">{spec}</p> : null}

        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.12em] text-muted">Your price</p>
          <p className="commerce-price mt-1">{authorizedPriceLabel(product)}</p>
          {stock && !unavailable ? <p className="commerce-meta mt-1">{stock}</p> : null}
          {stockHint ? (
            <p className={`mt-1 text-sm ${unavailable ? "text-accent-tac" : "text-muted"}`}>{stockHint}</p>
          ) : null}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <QtyControl label={product.name} value={qty} disabled={!canAdd || pending} onChange={setQty} />
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
          {message ? (
            <p className="mt-2 text-sm text-muted" role="status">
              {message}{" "}
              <Link href="/cart" className="underline underline-offset-4">
                View cart
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
