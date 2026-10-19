"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/cart";

export function AddToCartButton({
  productId,
  quantity = 1,
  allowQuantity = false,
}: {
  productId: string;
  quantity?: number;
  allowQuantity?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(quantity);

  return (
    <div>
      {allowQuantity && (
        <label className="mb-3 block text-sm text-muted">
          Quantity
          <input
            type="number"
            min={1}
            max={99}
            value={selectedQuantity}
            onChange={(event) => setSelectedQuantity(Number(event.target.value) || 1)}
            className="mt-1 w-24 border border-sand-200 bg-white px-3 py-2"
          />
        </label>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const result = await addToCart(productId, selectedQuantity);
          setPending(false);
          if (result.redirectTo) {
            router.push(result.redirectTo);
            return;
          }
          if (result.error) {
            setMessage(result.error);
            return;
          }
          setMessage("Added to cart.");
          router.refresh();
        }}
        className="bg-charcoal px-4 py-2 text-sm text-cream hover:bg-ink disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add to Cart"}
      </button>
      {message && <p className="mt-2 text-xs text-muted">{message}</p>}
    </div>
  );
}
