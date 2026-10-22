"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/app/actions/cart";
import { QtyControl } from "@/components/commerce/QtyControl";

export function AddToCartButton({
  productId,
  quantity = 1,
  allowQuantity = false,
  productName = "item",
}: {
  productId: string;
  quantity?: number;
  allowQuantity?: boolean;
  productName?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity);

  return (
    <div className="space-y-3">
      {allowQuantity ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted">Quantity</span>
          <QtyControl
            label={productName}
            value={selectedQuantity}
            disabled={pending}
            onChange={setSelectedQuantity}
          />
        </div>
      ) : null}
      <button
        type="button"
        disabled={pending}
        className="commerce-btn"
        onClick={async () => {
          setPending(true);
          setMessage(null);
          setError(null);
          const result = await addToCart(productId, selectedQuantity);
          setPending(false);
          if (result.redirectTo) {
            router.push(result.redirectTo);
            return;
          }
          if (result.error) {
            setError(result.error);
            return;
          }
          setMessage(`Added ${selectedQuantity} to cart.`);
          router.refresh();
        }}
      >
        {pending ? "Adding…" : "Add to cart"}
      </button>
      {error ? (
        <p className="text-sm text-accent-tac" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-muted" role="status">
          {message}{" "}
          <Link href="/cart" className="underline underline-offset-4">
            View cart
          </Link>
        </p>
      ) : null}
    </div>
  );
}
