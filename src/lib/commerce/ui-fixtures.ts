import type { Product } from "@/lib/types";

/**
 * Local layout-only fixtures. Never persist to catalog_products / Zoho / production.
 * Mark screenshots as “simulated layout verification”.
 */
function base(overrides: Partial<Product> & Pick<Product, "id" | "sku" | "slug" | "name">): Product {
  return {
    description: null,
    intendedUse: null,
    category: "professional_kit",
    highlights: [],
    contents: [],
    usageNotes: null,
    precautions: null,
    images: [],
    currency: "USD",
    professionalPriceCents: 1200,
    publicPriceVisible: false,
    inventoryStatus: "in_stock",
    availableQuantity: 40,
    shippingAttributes: {},
    publicationStatus: "active",
    reorderEligible: true,
    relatedProductIds: [],
    productKind: "replenishment",
    ...overrides,
  };
}

export const UI_FIXTURE_PRODUCTS: Product[] = [
  base({
    id: "fix-short",
    sku: "FIX-SHORT",
    slug: "fixture-short-name",
    name: "Short Name",
    shippingAttributes: { pack_label: "1 jar", unit_label: "per jar" },
    intendedUse: "Brief professional use note.",
    images: [],
  }),
  base({
    id: "fix-long",
    sku: "FIX-LONG-NAME-SKU-001",
    slug: "fixture-long-name",
    name: "Ultra Long Professional Replenishment Kit Name That Must Wrap Cleanly Without Overflowing Mobile Layout",
    description:
      "A longer description used only to stress paragraph width and spacing. No clinical claims are asserted by this fixture text.",
    contents: [
      { name: "Primary treatment step", quantity: 12 },
      { name: "Secondary prep", quantity: 2 },
      { name: "Accessory", quantity: 1 },
    ],
    shippingAttributes: { unit_of_measure: "per kit" },
    professionalPriceCents: 128900,
    images: [],
  }),
  base({
    id: "fix-oos",
    sku: "FIX-OOS",
    slug: "fixture-out-of-stock",
    name: "Out of Stock Example",
    inventoryStatus: "out_of_stock",
    availableQuantity: 0,
    shippingAttributes: { pack_label: "Box of 6" },
  }),
  base({
    id: "fix-noprice",
    sku: "FIX-NOPRICE",
    slug: "fixture-no-price",
    name: "Missing Store Price",
    professionalPriceCents: null,
    shippingAttributes: { pack_label: "1 unit" },
  }),
  base({
    id: "fix-multi-image",
    sku: "FIX-GALLERY",
    slug: "fixture-gallery",
    name: "Gallery Layout Example",
    images: [],
    highlights: ["Highlight one", "Highlight two"],
    usageNotes: "Usage notes appear only when provided by operators.",
    precautions: "Precautions appear only when approved.",
    intendedUse: "Intended-use copy from catalog fields.",
  }),
];

export const UI_FIXTURE_CART_LINES = [
  {
    productId: "fix-short",
    name: "Short Name",
    sku: "FIX-SHORT",
    quantity: 2,
    unitPriceCents: 1200,
    outOfStock: false,
    imageSrc: null as string | null,
    specLine: "1 jar · Sold per jar · SKU FIX-SHORT",
  },
  {
    productId: "fix-long",
    name: "Ultra Long Professional Replenishment Kit Name That Must Wrap Cleanly Without Overflowing Mobile Layout",
    sku: "FIX-LONG-NAME-SKU-001",
    quantity: 1,
    unitPriceCents: 128900,
    outOfStock: false,
    imageSrc: null as string | null,
    specLine: "12× Primary treatment step · +2 more · Sold per kit · SKU FIX-LONG-NAME-SKU-001",
  },
];
