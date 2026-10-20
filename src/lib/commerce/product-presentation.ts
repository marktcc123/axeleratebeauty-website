import type { Product } from "@/lib/types";

type ShippingDisplay = {
  pack_label?: unknown;
  unit_label?: unknown;
  unit_of_measure?: unknown;
  short_description?: unknown;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Pack / unit / short blurb:
 * 1) dedicated Product columns when present (after migration)
 * 2) shipping_attributes JSON keys (transitional)
 * 3) contents summary for pack only
 * Never invent clinical claims.
 */
export function productPackLabel(
  product: Pick<Product, "packLabel" | "contents" | "shippingAttributes" | "category">,
) {
  const fromColumn = asTrimmedString(product.packLabel);
  if (fromColumn) return fromColumn;

  const shipping = product.shippingAttributes as ShippingDisplay;
  const fromJson = asTrimmedString(shipping.pack_label);
  if (fromJson) return fromJson;

  if (product.contents.length > 0) {
    const parts = product.contents.map((item) => {
      const qty = item.quantity && item.quantity > 1 ? `${item.quantity}× ` : "";
      return `${qty}${item.name}`;
    });
    if (parts.length <= 2) return parts.join(" · ");
    return `${parts[0]} · +${parts.length - 1} more`;
  }

  return null;
}

export function productUnitLabel(product: Pick<Product, "unitLabel" | "shippingAttributes">) {
  const fromColumn = asTrimmedString(product.unitLabel);
  if (fromColumn) return fromColumn;
  const shipping = product.shippingAttributes as ShippingDisplay;
  return asTrimmedString(shipping.unit_label) ?? asTrimmedString(shipping.unit_of_measure);
}

export function productSpecLine(
  product: Pick<Product, "packLabel" | "unitLabel" | "contents" | "shippingAttributes" | "category" | "sku">,
) {
  const pack = productPackLabel(product);
  const unit = productUnitLabel(product);
  const bits = [pack, unit ? `Sold ${unit}` : null, `SKU ${product.sku}`].filter(Boolean);
  return bits.join(" · ");
}

export function productListBlurb(
  product: Pick<Product, "shortDescription" | "intendedUse" | "description" | "highlights" | "shippingAttributes">,
) {
  const fromColumn = asTrimmedString(product.shortDescription);
  if (fromColumn) return fromColumn;
  const shipping = product.shippingAttributes as ShippingDisplay;
  const fromJson = asTrimmedString(shipping.short_description);
  if (fromJson) return fromJson;
  if (product.intendedUse?.trim()) return product.intendedUse.trim();
  if (product.highlights[0]?.trim()) return product.highlights[0].trim();
  if (product.description?.trim()) {
    const text = product.description.trim();
    return text.length > 140 ? `${text.slice(0, 137).trimEnd()}…` : text;
  }
  return null;
}

export function productPrimaryImage(product: Pick<Product, "images">) {
  const src = product.images.find((image) => typeof image === "string" && image.trim());
  return src?.trim() ?? null;
}

export function inventoryCustomerLabel(status: Product["inventoryStatus"]) {
  switch (status) {
    case "out_of_stock":
      return "Out of stock";
    case "in_stock":
      return "In stock";
    case "untracked":
      return null;
    default:
      return null;
  }
}
