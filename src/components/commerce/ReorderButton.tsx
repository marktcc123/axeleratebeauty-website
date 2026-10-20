"use client";

import { useRouter } from "next/navigation";
import { reorderAuthorizedProduct } from "@/app/actions/cart";

export function ReorderButton({ productId }: { productId: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm underline-offset-4 hover:underline"
      onClick={async () => {
        const result = await reorderAuthorizedProduct(productId);
        if (result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }
        if (!result.error) router.push("/cart");
      }}
    >
      Reorder This Package
    </button>
  );
}
