"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { reorderAuthorizedProduct } from "@/app/actions/cart";

export function ReorderButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className="text-sm underline-offset-4 hover:underline disabled:opacity-50"
        onClick={async () => {
          setPending(true);
          setError(null);
          const result = await reorderAuthorizedProduct(productId);
          setPending(false);
          if (result.redirectTo) {
            router.push(result.redirectTo);
            return;
          }
          if (result.error) {
            setError(result.error);
            return;
          }
          router.push("/cart");
        }}
      >
        {pending ? "Checking…" : "Add again at current price"}
      </button>
      {error ? (
        <span className="max-w-[14rem] text-right text-xs text-accent-tac" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
