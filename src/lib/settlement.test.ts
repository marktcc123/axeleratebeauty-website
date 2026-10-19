import { describe, expect, it } from "vitest";
import { draftSettlement } from "./settlement";

describe("settlement drafts", () => {
  it("does not treat missing supplier cost as a zero commission", () => {
    const draft = draftSettlement({
      commercialModel: "commission",
      customerTotalCents: 100000,
      taxCents: 8000,
      shippingCents: 2500,
    });
    expect(draft?.status).toBe("cost_missing");
    expect(draft?.commissionCents).toBeNull();
    expect(draft?.commissionBaseCents).toBeNull();
  });

  it("calculates Brow Arc commission from supplier cost, not customer total", () => {
    const draft = draftSettlement({
      commercialModel: "commission",
      customerTotalCents: 100000,
      taxCents: 8000,
      shippingCents: 2500,
      supplierCostCents: 40000,
    });
    expect(draft?.commissionCents).toBe(6000);
    expect(draft?.ruleVersion).toBe("brow-arc-commission-v1");
  });

  it("does not invent wholesale profit when purchase cost is missing", () => {
    const draft = draftSettlement({
      commercialModel: "wholesale",
      customerTotalCents: 100000,
      taxCents: 0,
      shippingCents: 0,
    });
    expect(draft?.status).toBe("cost_missing");
  });
});
