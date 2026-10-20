import type { CartItem, Product } from "@/lib/types";

export class CommerceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "unauthenticated"
      | "unapproved"
      | "suspended"
      | "unpublished"
      | "out_of_stock"
      | "invalid_quantity"
      | "price_unavailable"
      | "empty_cart"
      | "not_configured"
      | "location_required"
      | "price_changed",
  ) {
    super(message);
    this.name = "CommerceError";
  }
}

export function assertApprovedBuyer(input: {
  userId?: string | null;
  verificationStatus?: string | null;
  activeLocationId?: string | null;
}) {
  if (!input.userId) {
    throw new CommerceError("Sign in with an approved business account to purchase.", "unauthenticated");
  }
  if (input.verificationStatus === "suspended") {
    throw new CommerceError("This business account is suspended.", "suspended");
  }
  if (input.verificationStatus !== "approved") {
    throw new CommerceError("Purchasing is available after business verification.", "unapproved");
  }
  if (!input.activeLocationId) {
    throw new CommerceError("Select an authorized store before checkout.", "location_required");
  }
}

export function assertPurchasableProduct(product: Product | null) {
  if (!product || product.publicationStatus !== "active") {
    throw new CommerceError("This product is not available for purchase.", "unpublished");
  }
  if (product.productKind === "full_system" || product.productKind === "internal_lot") {
    throw new CommerceError("This item is not available as a standard checkout product.", "unpublished");
  }
  if (product.professionalPriceCents == null || product.professionalPriceCents < 0) {
    throw new CommerceError("This product does not have an approved price for the selected store.", "price_unavailable");
  }
  if (product.inventoryStatus === "out_of_stock") {
    throw new CommerceError("This product is currently out of stock.", "out_of_stock");
  }
}

export function normalizeQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new CommerceError("Enter a quantity between 1 and 99.", "invalid_quantity");
  }
  return quantity;
}

export function assertInventory(product: Product, quantity: number) {
  if (product.inventoryStatus === "untracked") return;
  if (product.availableQuantity == null) return;
  if (product.availableQuantity < quantity) {
    throw new CommerceError("Requested quantity exceeds available inventory.", "out_of_stock");
  }
}

export function pricedCart(items: CartItem[], products: Product[]) {
  if (items.length === 0) {
    throw new CommerceError("Your cart is empty.", "empty_cart");
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  return items.map((item) => {
    const product = byId.get(item.productId) ?? null;
    assertPurchasableProduct(product);
    const quantity = normalizeQuantity(item.quantity);
    assertInventory(product!, quantity);
    return {
      product: product!,
      quantity,
      unitPriceCents: product!.professionalPriceCents!,
      lineTotalCents: product!.professionalPriceCents! * quantity,
    };
  });
}

export function cartTotals(lines: { lineTotalCents: number }[]) {
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  return {
    subtotalCents,
    shippingCents: null as number | null,
    taxCents: null as number | null,
    shippingPending: true,
    taxPending: true,
    merchandiseCents: subtotalCents,
    totalCents: null as number | null,
  };
}

/** Public/marketing surfaces: only show an amount when the SKU is marked publicly visible. */
export function publicPriceLabel(product: Pick<Product, "professionalPriceCents" | "publicPriceVisible" | "currency">) {
  if (!product.publicPriceVisible || product.professionalPriceCents == null) {
    return "Professional Pricing Available Upon Account Approval";
  }
  return formatMoney(product.professionalPriceCents, product.currency);
}

/**
 * Partner catalog after approval: show the server-resolved authorized unit price.
 * Does not use publicPriceVisible — that flag is only for anonymous/public marketing.
 */
export function authorizedPriceLabel(product: Pick<Product, "professionalPriceCents" | "currency">) {
  if (product.professionalPriceCents == null) {
    return "Price pending for this store";
  }
  return formatMoney(product.professionalPriceCents, product.currency);
}

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatPendingMoney(cents: number | null, pending: boolean, currency = "USD") {
  if (pending || cents == null) return "To be calculated";
  return formatMoney(cents, currency);
}
