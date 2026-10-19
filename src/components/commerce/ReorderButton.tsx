"use client";

import { useRouter } from "next/navigation";
import { reorderProduct } from "@/app/actions/cart";

export function ReorderButton({ slug }: { slug: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm underline-offset-4 hover:underline"
      onClick={async () => {
        const result = await reorderProduct(slug);
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
