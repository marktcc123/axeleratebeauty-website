import type { Product } from "@/lib/types";

type ShippingDisplay = {
  pack_label?: unknown;
  unit_label?: unknown;
  unit_of_measure?: unknown;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Spec / pack / sell unit from existing columns — never invent claims. */
export function productPackLabel(product: Pick<Product, "contents" | "shippingAttributes" | "category">) {
  const shipping = product.shippingAttributes as ShippingDisplay;
  const explicit = asTrimmedString(shipping.pack_label);
  if (explicit) return explicit;

  if (product.contents.length > 0) {
    const parts = product.contents.map((item) => {
      const qty = item.quantity && item.quantity > 1 ? `${item.quantity}× ` : "";
      return `${qty}${item.name}`;
    });
    if (parts.length <= 2) return parts.join(" · ");
    return `${parts[0]} · +${parts.length - 1} more`;
  }

  // Category already appears as an eyebrow; do not repeat it as a fake pack line.
  return null;
}

export function productUnitLabel(product: Pick<Product, "shippingAttributes">) {
  const shipping = product.shippingAttributes as ShippingDisplay;
  return asTrimmedString(shipping.unit_label) ?? asTrimmedString(shipping.unit_of_measure);
}

export function productSpecLine(product: Pick<Product, "contents" | "shippingAttributes" | "category" | "sku">) {
  const pack = productPackLabel(product);
  const unit = productUnitLabel(product);
  const bits = [pack, unit ? `Sold ${unit}` : null, `SKU ${product.sku}`].filter(Boolean);
  return bits.join(" · ");
}

/** One-line list blurb; omit when empty so layout does not reserve fake copy. */
export function productListBlurb(product: Pick<Product, "intendedUse" | "description" | "highlights">) {
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
