import type { CatalogProduct } from "./catalog-products";

export type ConcernFilter = "dryness" | "oily" | "sensitivity" | "radiance";

export type ProgramLineItem = {
  productId: string;
  kitQuantity: number;
  role: "backbar" | "retail";
};

export type FacialProgram = {
  id: string;
  slug: string;
  officialName: string;
  customerFacingName: string;
  shortPositioning: string;
  editorial: string;
  concernCategory: string;
  concernLabel: string;
  concernFilter: ConcernFilter;
  concerns: string[];
  duration: string;
  productFamily: string;
  treatmentFocus: string;
  accent: string;
  accentSoft: string;
  heroImage: string;
  audience: string[];
  lineItems: ProgramLineItem[];
  trainingNote: string;
  purchaseEligible: boolean;
  publicationStatus: "active";
  seoTitle: string;
  seoDescription: string;
};

export const PROFESSIONAL_PRICING_MESSAGE = "Professional Pricing Available Upon Account Approval";

export const facialPrograms: FacialProgram[] = [
  {
    id: "program-deep-hydration",
    slug: "deep-hydration",
    officialName: "Deep Hydration Facial Program",
    customerFacingName: "Deep Hydration Facial Program",
    shortPositioning: "Professional hydration care for dry, moisture-depleted skin.",
    editorial:
      "A professional Korean facial program designed to replenish moisture and support a softer, smoother, more hydrated-looking complexion.",
    concernCategory: "Moisture & Hydration",
    concernLabel: "Moisture & Hydration",
    concernFilter: "dryness",
    concerns: [
      "Dryness",
      "Dehydrated-looking skin",
      "Rough-looking texture",
      "Lack of a plump appearance",
      "Moisture barrier support",
    ],
    duration: "Approximately 30–40 minutes",
    productFamily: "MST + R06",
    treatmentFocus: "Hydration and moisture-replenishing care",
    accent: "#668DA5",
    accentSoft: "#E9F2F6",
    heroImage: "/images/family/system-02.webp",
    audience: [
      "Professional beauty salons expanding hydration services",
      "Estheticians offering nonmedical Korean facial menus",
      "Spas and brow or threading salons adding a focused moisture program",
    ],
    lineItems: [
      { productId: "lpr-3rd-definite-boost-peel", kitQuantity: 1, role: "backbar" },
      { productId: "mst-formula-concentration-activator", kitQuantity: 1, role: "backbar" },
      { productId: "mst-formula-completion-cream-190g", kitQuantity: 1, role: "backbar" },
      { productId: "r06-control-solution", kitQuantity: 4, role: "backbar" },
      { productId: "royal-gold-modeling-pack-500g", kitQuantity: 6, role: "backbar" },
      { productId: "mst-formula-completion-cream-30g", kitQuantity: 5, role: "retail" },
    ],
    trainingNote: "Contact our team for current professional training and onboarding details.",
    purchaseEligible: false,
    publicationStatus: "active",
    seoTitle: "Deep Hydration Facial Program | Dermabell Professional",
    seoDescription:
      "A professional Korean hydration facial program for spas and salons, with curated MST and R06 backbar products for moisture-depleted skin.",
  },
  {
    id: "program-clear-balance",
    slug: "clear-balance",
    officialName: "Acne-Prone Skin Facial Program",
    customerFacingName: "Clear Balance Facial Program",
    shortPositioning: "Professional balancing facial care for oily and blemish-prone skin.",
    editorial:
      "A professional Korean facial program designed for oily and blemish-prone skin, helping improve the appearance of excess shine, visible pores, and uneven-looking texture.",
    concernCategory: "Oil & Pore Appearance",
    concernLabel: "Oil & Pore Appearance",
    concernFilter: "oily",
    concerns: [
      "Excess shine",
      "Visible pores",
      "Blemish-prone appearance",
      "Congested-looking skin",
      "Uneven-looking texture",
    ],
    duration: "Approximately 30–40 minutes",
    productFamily: "TAC + T01 + P02",
    treatmentFocus: "Oil balance and pore-appearance care",
    accent: "#B36550",
    accentSoft: "#F7EBE5",
    heroImage: "/images/ampoules/t01.webp",
    audience: [
      "Professional beauty salons serving oily or blemish-prone appearances",
      "Estheticians adding a repeatable balancing facial",
      "Spas introducing a nonmedical clear-skin service concept",
    ],
    lineItems: [
      { productId: "lpr-2nd-intensive-boost-peel", kitQuantity: 1, role: "backbar" },
      { productId: "t01-control-solution", kitQuantity: 2, role: "backbar" },
      { productId: "p02-control-solution", kitQuantity: 2, role: "backbar" },
      { productId: "tac-formula-concentration-activator", kitQuantity: 1, role: "backbar" },
      { productId: "tac-formula-completion-cream-190g", kitQuantity: 1, role: "backbar" },
      { productId: "tac-relief-balance-modeling-pack-1000g", kitQuantity: 1, role: "backbar" },
      { productId: "tac-formula-completion-cream-30g", kitQuantity: 5, role: "retail" },
      { productId: "tac-purifying-wash-off-pack-100g", kitQuantity: 1, role: "retail" },
    ],
    trainingNote: "Contact our team for current professional training and onboarding details.",
    purchaseEligible: false,
    publicationStatus: "active",
    seoTitle: "Clear Balance Facial Program | Dermabell Professional",
    seoDescription:
      "A professional Korean facial program for oily and blemish-prone skin, pairing TAC, T01, and P02 products for salon menus.",
  },
  {
    id: "program-sts-barrier-repair",
    slug: "sts-barrier-repair",
    officialName: "STS Barrier Repair Facial Program",
    customerFacingName: "STS Barrier Repair Facial Program",
    shortPositioning: "Gentle professional facial care for sensitive and stressed-looking skin.",
    editorial:
      "A soothing professional Korean facial program designed for sensitive-looking skin, helping replenish moisture and support a calmer, healthier-looking complexion.",
    concernCategory: "Sensitive Skin Care",
    concernLabel: "Sensitive Skin Care",
    concernFilter: "sensitivity",
    concerns: [
      "Visible redness",
      "Dryness",
      "Sensitivity-related cosmetic concerns",
      "Stressed-looking skin",
      "Moisture barrier maintenance",
    ],
    duration: "Approximately 30–40 minutes",
    productFamily: "STS + S05",
    treatmentFocus: "Soothing care and moisture barrier support",
    accent: "#68866D",
    accentSoft: "#E8F0E8",
    heroImage: "/images/studio/washoff-sts-swatch.webp",
    audience: [
      "Salons serving guests with sensitive-looking skin",
      "Estheticians offering gentle, nonmedical soothing facials",
      "Spas adding a calm, barrier-support service concept",
    ],
    lineItems: [
      { productId: "lpr-1st-fundamental-boost-peel", kitQuantity: 1, role: "backbar" },
      { productId: "sts-formula-concentration-activator", kitQuantity: 1, role: "backbar" },
      { productId: "sts-formula-completion-cream-190g", kitQuantity: 1, role: "backbar" },
      { productId: "s05-control-solution", kitQuantity: 4, role: "backbar" },
      { productId: "aloe-soothing-care-gel-1000ml", kitQuantity: 1, role: "backbar" },
      { productId: "royal-rose-modeling-mask-500g", kitQuantity: 6, role: "backbar" },
      { productId: "sts-formula-completion-cream-30g", kitQuantity: 5, role: "retail" },
      { productId: "sts-vital-wash-off-pack-100g", kitQuantity: 5, role: "retail" },
      { productId: "royal-rose-modeling-mask-150g", kitQuantity: 5, role: "retail" },
    ],
    trainingNote: "Contact our team for current professional training and onboarding details.",
    purchaseEligible: false,
    publicationStatus: "active",
    seoTitle: "STS Barrier Repair Facial Program | Dermabell Professional",
    seoDescription:
      "A soothing professional Korean facial program for sensitive-looking skin, with STS and S05 products for spa and salon menus.",
  },
  {
    id: "program-glass-skin-glow",
    slug: "glass-skin-glow",
    officialName: "Glass Skin Glow Facial Program",
    customerFacingName: "Glass Skin Glow Facial Program",
    shortPositioning: "Professional radiance-focused facial care for dull and uneven-looking skin.",
    editorial:
      "A professional Korean facial program designed to enhance the appearance of radiance, hydration, and smoother-looking skin.",
    concernCategory: "Radiance & Glow",
    concernLabel: "Radiance & Glow",
    concernFilter: "radiance",
    concerns: [
      "Dull-looking skin",
      "Uneven-looking skin tone",
      "Lack of luminosity",
      "Rough-looking texture",
      "Dehydrated appearance",
    ],
    duration: "Approximately 30–40 minutes",
    productFamily: "WBU + W04",
    treatmentFocus: "Visible radiance and glow-focused care",
    accent: "#B49A55",
    accentSoft: "#F8F1E2",
    heroImage: "/images/retail/melting-hero.webp",
    audience: [
      "Beauty salons adding a glow-focused Korean facial",
      "Estheticians offering radiance and hydration-oriented services",
      "Spas introducing a glass-skin appearance treatment concept",
    ],
    lineItems: [
      { productId: "hydrating-milky-emulsion-500ml", kitQuantity: 1, role: "backbar" },
      { productId: "lpr-3rd-definite-boost-peel", kitQuantity: 1, role: "backbar" },
      { productId: "w04-control-solution", kitQuantity: 4, role: "backbar" },
      { productId: "wbu-formula-concentration-activator", kitQuantity: 1, role: "backbar" },
      { productId: "wbu-formula-completion-cream-190g", kitQuantity: 1, role: "backbar" },
      { productId: "reju-control-melting-mask-70g", kitQuantity: 15, role: "retail" },
      { productId: "wbu-formula-completion-cream-30g", kitQuantity: 5, role: "retail" },
    ],
    trainingNote: "Contact our team for current professional training and onboarding details.",
    purchaseEligible: false,
    publicationStatus: "active",
    seoTitle: "Glass Skin Glow Facial Program | Dermabell Professional",
    seoDescription:
      "A professional Korean glass-skin facial program for salons, pairing WBU and W04 products to support a more radiant-looking complexion.",
  },
];

export type ResolvedLineItem = ProgramLineItem & { product: CatalogProduct };

export const concernFilters: { id: ConcernFilter | "all"; label: string }[] = [
  { id: "all", label: "All programs" },
  { id: "dryness", label: "Dryness" },
  { id: "oily", label: "Oily / Blemish-Prone Appearance" },
  { id: "sensitivity", label: "Sensitivity / Visible Redness" },
  { id: "radiance", label: "Dullness / Radiance" },
];
