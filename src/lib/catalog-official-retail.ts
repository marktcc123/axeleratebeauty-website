import { readFileSync } from "fs";
import path from "path";
import { isBrowseOnlyProduct, productBarcodes } from "@/lib/catalog-browse";
import type { Product } from "@/lib/types";

export { isBrowseOnlyProduct, productBarcodes };

export type OfficialVariant = {
  id: string;
  sourceRow: number;
  barcode: string | null;
  barcodeKind: string;
  barcodeComponents: Record<string, string> | null;
  nameEn: string;
  nameAliasEn?: string | null;
  groupNameEn: string;
  packLabel: string | null;
  packSpecRaw: string | null;
  boxDimensionMm: string | null;
  unitDimensionMm: string | null;
  unitGrossWeight: string | null;
  boxGrossWeight: string | null;
  cartonPackQty: number | null;
  category: string;
  comingSoon: boolean;
  images: string[];
  slugHint: string;
};

export type OfficialProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  comingSoon: boolean;
  variants: OfficialVariant[];
  images: string[];
  source: string;
};

type CatalogFile = {
  version: number;
  products: OfficialProduct[];
};

/** Known staging commerce rows that already carry tier prices — price only, not identity. */
export const OFFICIAL_PRICE_BRIDGES: Record<string, { stagingSlug: string; note: string }> = {
  "8809645782874": {
    stagingSlug: "staging-melting-mask",
    note: "Melting Mask 70g barcode bridges to existing staging priced SKU without converting STG identity.",
  },
};

let cached: OfficialProduct[] | null = null;

export function officialRetailCatalogEnabled() {
  if (process.env.OFFICIAL_RETAIL_CATALOG === "0") return false;
  // Feature-branch Preview / local: on by default. Production requires explicit opt-in.
  if (process.env.VERCEL_ENV === "production" && process.env.OFFICIAL_RETAIL_CATALOG !== "1") {
    return false;
  }
  return true;
}

export function loadOfficialRetailCatalog(): OfficialProduct[] {
  if (!officialRetailCatalogEnabled()) return [];
  if (cached) return cached;
  const file = path.join(process.cwd(), "data/imports/official-retail-1019/catalog.json");
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as CatalogFile;
    cached = parsed.products ?? [];
    return cached;
  } catch {
    cached = [];
    return cached;
  }
}

export function officialProductToCatalogProduct(product: OfficialProduct): Product {
  const variants = product.variants;
  const primary = variants[0];
  const packLabels = [...new Set(variants.map((v) => v.packLabel).filter(Boolean))];
  const packLabel =
    packLabels.length > 1 ? packLabels.join(" / ") : primary?.packLabel ?? null;
  const comingSoon = product.comingSoon || variants.every((v) => v.comingSoon);
  const images = product.images.length
    ? product.images
    : variants.flatMap((v) => v.images).filter(Boolean);

  return {
    id: product.id,
    sku: primary?.barcode ? `BC-${primary.barcode}` : `OR-${product.id}`,
    slug: product.slug,
    name: product.name.replace(/^Dermabell\s+/i, "Dermabell "),
    description: null,
    intendedUse: null,
    shortDescription: null,
    packLabel,
    unitLabel: "each",
    category: product.category,
    highlights: [],
    contents: [],
    usageNotes: null,
    precautions: null,
    images,
    currency: "USD",
    professionalPriceCents: null,
    publicPriceVisible: false,
    inventoryStatus: comingSoon ? "out_of_stock" : "untracked",
    availableQuantity: null,
    shippingAttributes: {
      catalogSource: "official-retail-1019",
      orderingMode: "browse_only",
      comingSoon,
      barcode: primary?.barcode ?? null,
      barcodeComponents: primary?.barcodeComponents ?? null,
      cartonPackQty: primary?.cartonPackQty ?? null,
      boxDimensionMm: primary?.boxDimensionMm ?? null,
      unitDimensionMm: primary?.unitDimensionMm ?? null,
      unitGrossWeight: primary?.unitGrossWeight ?? null,
      boxGrossWeight: primary?.boxGrossWeight ?? null,
      variants: variants.map((v) => ({
        id: v.id,
        sourceRow: v.sourceRow,
        barcode: v.barcode,
        barcodeKind: v.barcodeKind,
        barcodeComponents: v.barcodeComponents,
        packLabel: v.packLabel,
        packSpecRaw: v.packSpecRaw,
        images: v.images,
        comingSoon: v.comingSoon,
        nameAliasEn: v.nameAliasEn ?? null,
      })),
    },
    publicationStatus: "active",
    reorderEligible: false,
    relatedProductIds: [],
    productKind: "replenishment",
  };
}

export function listOfficialRetailProducts(): Product[] {
  return loadOfficialRetailCatalog().map(officialProductToCatalogProduct);
}

export function getOfficialRetailProductBySlug(slug: string): Product | null {
  const product = loadOfficialRetailCatalog().find((entry) => entry.slug === slug);
  return product ? officialProductToCatalogProduct(product) : null;
}

export function getOfficialRetailProductsByIds(ids: string[]): Product[] {
  const set = new Set(ids);
  return loadOfficialRetailCatalog()
    .filter((entry) => set.has(entry.id))
    .map(officialProductToCatalogProduct);
}
