import type { Product } from "@/lib/types";

/** Barcodes that may inherit an existing staged offer — never invent sibling-size prices. */
export const OFFICIAL_PRICE_BRIDGE_BARCODES = new Set(["8809645782874"]);

/** Client-safe browse/purchase flags — no filesystem imports. */
export function isBrowseOnlyProduct(product: Product) {
  const attrs = product.shippingAttributes ?? {};
  if (attrs.comingSoon === true) return true;
  if (attrs.orderingMode === "browse_only") return true;
  if (attrs.catalogSource === "official-retail-1019" && product.professionalPriceCents == null) {
    return true;
  }
  return false;
}

/** Multi-variant official groups with a partial price bridge stay card-browse-only. */
export function productCardPurchaseEnabled(product: Product) {
  if (isBrowseOnlyProduct(product)) return false;
  if (product.professionalPriceCents == null) return false;
  const variants = product.shippingAttributes?.variants;
  if (!Array.isArray(variants) || variants.length <= 1) return true;
  if (product.shippingAttributes?.priceBridge === true) return false;
  return true;
}

export type CatalogDetailVariant = {
  id: string;
  packLabel: string | null;
  barcode: string | null;
  images: string[];
  comingSoon?: boolean;
  packSpecRaw?: string | null;
};

export function variantIsPurchasable(
  product: Product,
  variant: { barcode?: string | null; comingSoon?: boolean },
) {
  if (variant.comingSoon) return false;
  if (product.professionalPriceCents == null) return false;
  if (product.shippingAttributes?.orderingMode === "browse_only") return false;
  if (product.shippingAttributes?.priceBridge === true) {
    return typeof variant.barcode === "string" && OFFICIAL_PRICE_BRIDGE_BARCODES.has(variant.barcode);
  }
  return true;
}

export function productBarcodes(product: Product): string[] {
  const attrs = product.shippingAttributes ?? {};
  const list: string[] = [];
  if (typeof attrs.barcode === "string" && attrs.barcode) list.push(attrs.barcode);
  const variants = attrs.variants;
  if (Array.isArray(variants)) {
    for (const variant of variants) {
      if (variant && typeof variant === "object") {
        const barcode = (variant as { barcode?: unknown }).barcode;
        if (typeof barcode === "string" && barcode) list.push(barcode);
      }
    }
  }
  return [...new Set(list)];
}
