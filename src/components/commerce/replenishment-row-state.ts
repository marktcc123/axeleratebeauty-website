import { authorizedPriceLabel } from "@/lib/commerce/guards";
import type { Product } from "@/lib/types";

export function replenishmentRowState(product: Pick<Product, "professionalPriceCents" | "currency" | "inventoryStatus">) {
  const priced = product.professionalPriceCents != null;
  const unavailable = product.inventoryStatus === "out_of_stock";
  return {
    priceLabel: authorizedPriceLabel(product),
    priced,
    unavailable,
    canAdd: priced && !unavailable,
    stockHint: unavailable ? "Out of stock" : !priced ? "No valid price for this store" : null,
  };
}
