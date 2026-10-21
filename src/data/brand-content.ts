/**
 * Brand / presentation content — separate from purchasable catalog pricing & inventory.
 * Official Dermabell Global public pages are references only; nothing here auto-lists SKUs for sale.
 */

export type BrandMatchStatus =
  | "confirmed"
  | "pending_size_verify"
  | "mismatch_different_sku"
  | "missing"
  | "local_candidate";

export type ProductResource = {
  label: string;
  href: string;
  locale: "en" | "kr" | "jp" | "cn";
  /** "guide" opens docs; "pdf" only when the URL is a direct file download. */
  kind: "guide" | "pdf";
};

export type ProductContentEntry = {
  /** Match staging / commerce slug when known. */
  slug?: string;
  skuHints?: string[];
  officialName: string;
  packLabelHint?: string;
  unitLabelHint?: string;
  /** Candidate local path — applied to UI only when matchStatus === "confirmed". */
  candidateImage?: string;
  sourceImageUrl?: string;
  sourcePage: string;
  matchStatus: BrandMatchStatus;
  matchNotes: string;
  resources?: ProductResource[];
  /** When false, resources stay docs-only (size / SKU not verified). */
  applyResources?: boolean;
};

/** Series tiles for Home / About — not sellable SKUs. */
export const BRAND_SERIES = [
  {
    id: "high-essential",
    name: "High-Essential",
    href: "/professional-programs",
    image: "/images/brand-ref/series/high-essential.png",
    alt: "Dermabell High-Essential product series",
    blurb: "Professional treatment and retail-care textures for beauty businesses.",
  },
  {
    id: "professional",
    name: "Professional",
    href: "/professional-programs",
    image: "/images/brand-ref/series/professional.png",
    alt: "Dermabell Professional series",
    blurb: "Backbar-focused lines used in structured facial programs.",
  },
  {
    id: "fit-formance",
    name: "Fit-formance",
    href: "/for-professionals",
    image: "/images/brand-ref/series/fit-formance.png",
    alt: "Dermabell Fit-formance series",
    blurb: "Targeted care concepts — ask which SKUs are available to order in the U.S.",
  },
  {
    id: "modeling-pack",
    name: "Modeling Pack",
    href: "/for-professionals",
    image: "/images/brand-ref/series/modeling-pack.png",
    alt: "Dermabell Modeling Pack series",
    blurb: "Professional mask formats — availability depends on your authorized catalog.",
  },
] as const;

export const HOME_TEXTURE = {
  src: "/images/brand-ref/series/home-texture-01.png",
  alt: "Dermabell professional skincare texture detail",
  sourcePage: "https://dermabellglobal.com/",
  sourceUrl: "https://cdn.imweb.me/thumbnail/20260417/bd13866a5fc62.png",
} as const;

/**
 * SKU-level content map. Images apply only when matchStatus is "confirmed".
 * Pricing / inventory never come from this file.
 */
export const PRODUCT_CONTENT_MAP: ProductContentEntry[] = [
  {
    slug: "staging-melting-mask",
    skuHints: ["STG-MELTING-MASK", "melting"],
    officialName: "High-Essential Reju Control Melting Mask",
    packLabelHint: "70 g (Axelerate sales record — confirm vs packaging)",
    unitLabelHint: "each",
    candidateImage: "/images/brand-ref/b2b-candidates/he-reju-control-melting-mask.png",
    sourceImageUrl: "https://cdn.imweb.me/thumbnail/20260804/1162af8f08531.png",
    sourcePage: "https://dermabellglobal.com/b2b",
    matchStatus: "pending_size_verify",
    matchNotes:
      "Official B2B lists High-Essential Reju Control Melting Mask with a 1280×1280 pack image. Axelerate sales record is Melting Mask 70. Do not bind until jar size on pack matches. Separate product “Expert Formula Lab Infuse Glaze Melting Mask” has EN guide named 110g and CN guide named 120g — different SKU; never use those assets for Melting Mask 70.",
    resources: [
      {
        label: "View product guide",
        href: "https://drive.google.com/file/d/151Nx8CPJXi57nQXRiTJfotIoJcT681cQ/view?usp=drive_link",
        locale: "en",
        kind: "guide",
      },
    ],
    applyResources: false,
  },
  {
    officialName: "Expert Formula Lab Infuse Glaze Melting Mask",
    candidateImage: "/images/brand-ref/b2b-candidates/expert-infuse-glaze-melting-mask.png",
    sourceImageUrl: "https://cdn.imweb.me/thumbnail/20260805/29e75872edc8a.png",
    sourcePage: "https://dermabellglobal.com/b2b",
    matchStatus: "mismatch_different_sku",
    matchNotes:
      "EN Gamma doc title includes 110g; CN includes 120g. Not Axelerate Melting Mask 70. Kept as negative control only.",
    resources: [
      {
        label: "View product guide",
        href: "https://gamma.app/docs/Dermabell-Expert-Formula-Infuse-Glaze-Melting-Mask-110g-EN-mh7mrcbrreq6hex",
        locale: "en",
        kind: "guide",
      },
    ],
    applyResources: false,
  },
];

export function contentEntryForProduct(product: { slug: string; sku: string; name: string }) {
  return (
    PRODUCT_CONTENT_MAP.find((entry) => entry.slug && entry.slug === product.slug) ??
    PRODUCT_CONTENT_MAP.find((entry) =>
      entry.skuHints?.some((hint) => product.sku.toLowerCase().includes(hint.toLowerCase())),
    ) ??
    null
  );
}

/** Merge presentation fields without changing price or inventing sellable SKUs. */
export function withBrandPresentation<T extends { slug: string; sku: string; name: string; images: string[] }>(
  product: T,
): T & { brandResources: ProductResource[] } {
  const entry = contentEntryForProduct(product);
  if (!entry) return { ...product, brandResources: [] };

  const images =
    entry.matchStatus === "confirmed" && entry.candidateImage && product.images.length === 0
      ? [entry.candidateImage]
      : product.images;

  const brandResources =
    entry.applyResources && entry.resources
      ? entry.resources.filter((resource) => resource.locale === "en")
      : [];

  return { ...product, images, brandResources };
}
