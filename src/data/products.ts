export const skinPrograms = [
  {
    code: "MST",
    name: "Moisture",
    tone: "#6b8a9e",
    activator:
      "Hydrating serum with corn silk exosomes and AQUAXYL for lasting moisture.",
    cream:
      "ECOCERAMIDE Rice Bran cream that refines texture and locks in hydration.",
  },
  {
    code: "LFU",
    name: "Lift & Firm",
    tone: "#8a7a94",
    activator:
      "Firming serum with pine leaf exosomes and snowflake bulb extract for elasticity.",
    cream:
      "ECOCERAMIDE Macadamia cream that helps prevent moisture loss.",
  },
  {
    code: "STS",
    name: "Soothing",
    tone: "#7a8f74",
    activator:
      "Soothing serum with Centella asiatica exosomes and peptides to calm the barrier.",
    cream:
      "ECOCERAMIDE Olive cream for sensitive, easily irritated skin.",
  },
  {
    code: "TAC",
    name: "Clarify",
    tone: "#a67c6d",
    activator:
      "Clarifying serum with tannin exosomes and DENDRICLEAR to purify excess sebum.",
    cream:
      "ECOCERAMIDE Tea Tree cream for balanced, healthier-looking skin.",
  },
  {
    code: "WBU",
    name: "Brighten",
    tone: "#b8896a",
    activator:
      "Brightening serum with Opuntia Ficus-Indica exosomes and Melazero V2.",
    cream:
      "ECOCERAMIDE Peach Blossom cream for a more even, supple finish.",
  },
] as const;

export const controlSolutions = [
  {
    code: "T01",
    concern: "Acne",
    ingredient: "BB-BIONT",
    tone: "#c45c4a",
    blurb: "Microbiome balance that helps reduce blemish triggers.",
    image: "/images/ampoules/t01.webp",
  },
  {
    code: "P02",
    concern: "Pores",
    ingredient: "MATMARINE",
    tone: "#c8794a",
    blurb: "Pore-refining care for excess sebum and congestion.",
    image: "/images/ampoules/p02.webp",
  },
  {
    code: "B03",
    concern: "Pigmentation",
    ingredient: "LIPOCHROMAN",
    tone: "#c9a04a",
    blurb: "Toning formula for radiance and antioxidant support.",
    image: "/images/ampoules/b03.webp",
  },
  {
    code: "W04",
    concern: "UV pigmentation",
    ingredient: "BRIGHLETTE",
    tone: "#8fa84a",
    blurb: "Brightening care that helps inhibit melanin synthesis.",
    image: "/images/ampoules/w04.webp",
  },
  {
    code: "S05",
    concern: "Skin texture",
    ingredient: "FENSEBIOME",
    tone: "#5f8f5a",
    blurb: "Soothing formula for comfort and defensive capacity.",
    image: "/images/ampoules/s05.webp",
  },
  {
    code: "R06",
    concern: "Skin tone",
    ingredient: "DAWNERGY",
    tone: "#4a9a8f",
    blurb: "Vitality-boosting formula for fatigued, dull-looking skin.",
    image: "/images/ampoules/r06.webp",
  },
  {
    code: "F07",
    concern: "Elasticity",
    ingredient: "CELLYNKAGE",
    tone: "#4a7fad",
    blurb: "Tightening formula for early signs of aging.",
    image: "/images/ampoules/f07.webp",
  },
  {
    code: "W08",
    concern: "Wrinkles",
    ingredient: "REPROAGE",
    tone: "#4a5f9e",
    blurb: "Revitalization for smoother, more vibrant skin.",
    image: "/images/ampoules/w08.webp",
  },
  {
    code: "V09",
    concern: "Deep wrinkles",
    ingredient: "Argireline",
    tone: "#6f4f8f",
    blurb: "Firming formula for density and a lifted appearance.",
    image: "/images/ampoules/v09.webp",
  },
  {
    code: "E10",
    concern: "Dark circles",
    ingredient: "EYEDELINE",
    tone: "#9a4a6a",
    blurb: "Eye-area care for anti-aging and antioxidant protection.",
    image: "/images/ampoules/e10.webp",
  },
] as const;

export const professionalLine = [
  "Smart Hydro H2O Pure Water",
  "Sensitive Soothing Toner",
  "Gentle Milky Soft Cleanser",
  "Mild Moisturizing Cleansing Foam",
  "Blackhead Softening Solution",
  "Aloe Soothing Care Gel",
  "Soothing Massage Cream",
  "Hydrating Milky Emulsion",
  "Mild Moisturizing Toner",
] as const;

export const boostPeels = [
  {
    name: "LPR 1st Fundamental Boost Peel",
    detail: "pH 3.8 · PHA + LHA with green tea water to soothe and refine.",
  },
  {
    name: "LPR 2nd Intensive Boost Peel",
    detail: "pH 3.5 · BHA with Damask rose water to purify pores.",
  },
  {
    name: "LPR 3rd Definite Boost Peel",
    detail: "pH 3.7 · AHA with blue lotus water for a glass-skin finish.",
  },
] as const;

export const highEssential = [
  {
    name: "Melting Mask",
    detail: "Occlusive peel-off mask that drives active penetration for a glass-skin finish.",
    image: "/images/retail/melting-hero.webp",
  },
  {
    name: "Luxe Glow Cream",
    detail: "Water-gloss finishing cream for dewy, camera-ready radiance at checkout.",
    image: "/images/retail/luxe-cream.webp",
  },
  {
    name: "Melting + Luxe Duo",
    detail: "The retail attach pair guests take home after Express Facial.",
    image: "/images/retail/melting-luxe.webp",
  },
] as const;

export const gallery = {
  family: [
    {
      src: "/images/family/system-01.webp",
      alt: "Dermabell Formula Completion Cream family on stepped display",
    },
    {
      src: "/images/family/system-02.webp",
      alt: "Dermabell Activators, Creams, Peels and Control Solutions lineup",
    },
    {
      src: "/images/family/system-03.webp",
      alt: "Dermabell Fit-formance system product group shot",
    },
  ],
  studio: [
    {
      src: "/images/studio/studio-44.webp",
      alt: "Dermabell wash-off pack product photography",
      caption: "Wash-Off Packs",
    },
    {
      src: "/images/studio/washoff-sts-scatter.webp",
      alt: "STS Vital Wash-Off Pack with packaging",
      caption: "STS Vital Wash-Off Pack",
    },
    {
      src: "/images/studio/studio-64.webp",
      alt: "Dermabell retail-ready product photography",
      caption: "Retail-ready",
    },
  ],
  accents: [
    { src: "/images/retail/gold.webp", alt: "Dermabell gold-tone retail packaging" },
    { src: "/images/retail/rose.webp", alt: "Dermabell rose-tone retail packaging" },
    { src: "/images/retail/melting-pack.webp", alt: "Dermabell Melting Mask packaging" },
  ],
} as const;
