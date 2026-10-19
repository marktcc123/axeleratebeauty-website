import { catalogProducts, type CatalogProduct } from "@/data/catalog-products";
import {
  facialPrograms,
  PROFESSIONAL_PRICING_MESSAGE,
  type FacialProgram,
  type ResolvedLineItem,
} from "@/data/facial-programs";

export { PROFESSIONAL_PRICING_MESSAGE };

export function listPublishedPrograms() {
  return facialPrograms.filter((program) => program.publicationStatus === "active");
}

export function getProgramBySlug(slug: string) {
  return listPublishedPrograms().find((program) => program.slug === slug) ?? null;
}

export function getCatalogProduct(id: string) {
  return catalogProducts.find((product) => product.id === id) ?? null;
}

export function resolveProgramItems(program: FacialProgram): ResolvedLineItem[] {
  return program.lineItems.map((item) => {
    const product = getCatalogProduct(item.productId);
    if (!product) {
      throw new Error(`Missing catalog product ${item.productId} for ${program.slug}`);
    }
    return { ...item, product };
  });
}

export function itemsByRole(program: FacialProgram, role: "backbar" | "retail") {
  return resolveProgramItems(program).filter((item) => item.role === role);
}

export function formatLineItem(item: ResolvedLineItem) {
  const { product, kitQuantity } = item;
  if (product.innerPackCount && product.innerUnitSize) {
    const packs = kitQuantity === 1 ? "1 pack" : `${kitQuantity} packs`;
    return `${product.name} — ${packs}, ${product.innerPackCount} × ${product.innerUnitSize} ampoules per pack.`;
  }
  return `${product.name} — ${product.size} × ${kitQuantity}`;
}

export function includedProductTypeCount(program: FacialProgram) {
  return new Set(program.lineItems.map((item) => item.productId)).size;
}

export function programHasBackbarAndRetail(program: FacialProgram) {
  return {
    backbar: program.lineItems.some((item) => item.role === "backbar"),
    retail: program.lineItems.some((item) => item.role === "retail"),
  };
}

export function isProgramPurchasable(program: FacialProgram) {
  return program.purchaseEligible === true && program.publicationStatus === "active";
}

const PRICE_KEYS = /^(price|msrp|discount|pricecents|professionalpricecents|unitpricecents|regularvalue|skuvalue)$/i;

export function catalogContainsRestrictedPriceFields(value: unknown): string[] {
  const leaks: string[] = [];
  const walk = (node: unknown, path: string) => {
    if (!node || typeof node !== "object") return;
    for (const [key, child] of Object.entries(node)) {
      const next = path ? `${path}.${key}` : key;
      if (PRICE_KEYS.test(key)) leaks.push(next);
      walk(child, next);
    }
  };
  walk(value, "");
  return leaks;
}

export function listSharedProducts(): CatalogProduct[] {
  const counts = new Map<string, number>();
  for (const program of facialPrograms) {
    for (const item of program.lineItems) {
      counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
    }
  }
  return catalogProducts.filter((product) => (counts.get(product.id) ?? 0) > 1);
}
