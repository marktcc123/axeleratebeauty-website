import { describe, expect, it } from "vitest";
import { contentEntryForProduct, withBrandPresentation } from "./brand-content";

describe("brand content map", () => {
  it("does not bind Melting Mask pack image while size is unverified", () => {
    const product = withBrandPresentation({
      slug: "staging-melting-mask",
      sku: "STG-MELTING-MASK",
      name: "Melting Mask",
      images: [],
    });
    expect(product.images).toEqual([]);
    expect(product.brandResources).toEqual([]);
    expect(contentEntryForProduct(product)?.matchStatus).toBe("pending_size_verify");
  });

  it("keeps Infuse Glaze Melting Mask as a mismatch control", () => {
    const entry = contentEntryForProduct({
      slug: "other",
      sku: "OTHER",
      name: "x",
    });
    expect(entry).toBeNull();
  });
});
