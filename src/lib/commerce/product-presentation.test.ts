import { describe, expect, it } from "vitest";
import {
  inventoryCustomerLabel,
  productListBlurb,
  productPackLabel,
  productPrimaryImage,
  productSpecLine,
  productUnitLabel,
} from "./product-presentation";

const base = {
  sku: "STG-DEMO",
  category: "professional_kit",
  contents: [] as { name: string; quantity?: number }[],
  shippingAttributes: {} as Record<string, unknown>,
  intendedUse: null as string | null,
  description: null as string | null,
  highlights: [] as string[],
  images: [] as string[],
};

describe("product presentation", () => {
  it("prefers pack_label from shipping attributes", () => {
    expect(
      productPackLabel({
        ...base,
        shippingAttributes: { pack_label: "Box of 10 masks" },
      }),
    ).toBe("Box of 10 masks");
  });

  it("does not invent pack copy from category alone", () => {
    expect(productPackLabel(base)).toBeNull();
  });

  it("summarizes package contents when pack_label missing", () => {
    expect(
      productPackLabel({
        ...base,
        contents: [
          { name: "Mask", quantity: 10 },
          { name: "Brush", quantity: 1 },
        ],
      }),
    ).toBe("10× Mask · Brush");
  });

  it("builds spec line with unit and sku", () => {
    expect(
      productSpecLine({
        ...base,
        shippingAttributes: { pack_label: "1 kit", unit_label: "per kit" },
      }),
    ).toBe("1 kit · Sold per kit · SKU STG-DEMO");
  });

  it("hides blurb when no real copy", () => {
    expect(productListBlurb(base)).toBeNull();
  });

  it("uses intended use before truncating description", () => {
    expect(
      productListBlurb({
        ...base,
        intendedUse: "Professional facial step",
        description: "Longer unused text",
      }),
    ).toBe("Professional facial step");
  });

  it("returns null primary image without inventing packaging art", () => {
    expect(productPrimaryImage(base)).toBeNull();
    expect(productPrimaryImage({ images: [" /img.webp "] })).toBe("/img.webp");
  });

  it("maps inventory labels without inventing quantity", () => {
    expect(inventoryCustomerLabel("out_of_stock")).toBe("Out of stock");
    expect(inventoryCustomerLabel("untracked")).toBeNull();
    expect(productUnitLabel({ shippingAttributes: { unit_of_measure: "each" } })).toBe("each");
  });
});
