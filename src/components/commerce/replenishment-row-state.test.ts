import { describe, expect, it } from "vitest";
import { replenishmentRowState } from "./replenishment-row-state";

describe("replenishmentRowState fixtures", () => {
  it("shows authorized dollars without publicPriceVisible", () => {
    const state = replenishmentRowState({
      professionalPriceCents: 1200,
      currency: "USD",
      inventoryStatus: "in_stock",
    });
    expect(state.priceLabel).toBe("$12.00");
    expect(state.canAdd).toBe(true);
    expect(state.stockHint).toBeNull();
  });

  it("blocks add when price is missing", () => {
    const state = replenishmentRowState({
      professionalPriceCents: null,
      currency: "USD",
      inventoryStatus: "in_stock",
    });
    expect(state.canAdd).toBe(false);
    expect(state.stockHint).toBe("No valid price for this store");
  });

  it("blocks add when out of stock", () => {
    const state = replenishmentRowState({
      professionalPriceCents: 1200,
      currency: "USD",
      inventoryStatus: "out_of_stock",
    });
    expect(state.canAdd).toBe(false);
    expect(state.stockHint).toBe("Out of stock");
  });
});
