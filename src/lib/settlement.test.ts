import { describe, expect, it } from "vitest";
import { bellePurchaseCostFromExcelE, draftSettlement } from "./settlement";

describe("settlement drafts", () => {
  it("keeps Brow Arc pending when the commission base is missing", () => {
    const draft = draftSettlement({
      commercialModel: "commission",
      customerTotalCents: 100000,
      taxCents: 8000,
      shippingCents: 2500,
      purchaseCostCents: 40000,
    });
    expect(draft?.status).toBe("cost_missing");
    expect(draft?.commissionCents).toBeNull();
    expect(draft?.commissionBaseCents).toBeNull();
    expect(draft?.purchaseCostCents).toBeNull();
  });

  it("calculates Brow Arc commission from confirmed supplier sales, not Belle cost", () => {
    const draft = draftSettlement({
      commercialModel: "commission",
      customerTotalCents: 100000,
      taxCents: 8000,
      shippingCents: 2500,
      purchaseCostCents: 40000,
      commissionBaseCents: 50000,
    });
    expect(draft?.commissionCents).toBe(7500);
    expect(draft?.commissionBaseCents).toBe(50000);
    expect(draft?.purchaseCostCents).toBeNull();
  });

  it("derives Belle purchase cost as Excel E divided by 0.6", () => {
    expect(bellePurchaseCostFromExcelE(6000)).toBe(10000);
  });

  it("does not invent wholesale profit when purchase cost is missing", () => {
    const draft = draftSettlement({
      commercialModel: "wholesale",
      customerTotalCents: 100000,
      taxCents: 0,
      shippingCents: 0,
    });
    expect(draft?.status).toBe("cost_missing");
    expect(draft?.commissionBaseCents).toBeNull();
  });

  it("records refund adjustments without replacing the original sale semantics", () => {
    const draft = draftSettlement({
      commercialModel: "wholesale",
      customerTotalCents: 2000,
      taxCents: 0,
      shippingCents: 0,
      purchaseCostCents: 1000,
      recordKind: "refund_adjustment",
    });
    expect(draft?.recordKind).toBe("refund_adjustment");
    expect(draft?.status).toBe("adjusted");
  });
});
