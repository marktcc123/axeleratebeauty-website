export const SETTLEMENT_RULE_VERSION = {
  commission: "brow-arc-commission-v2",
  wholesale: "belle-wholesale-v2",
} as const;

export type SettlementDraft = {
  commercialModel: "commission" | "wholesale";
  recordKind: "sale" | "refund_adjustment";
  ruleVersion: string;
  customerTotalCents: number;
  taxCents: number;
  shippingCents: number;
  processorFeeCents: number | null;
  purchaseCostCents: number | null;
  commissionBaseCents: number | null;
  commissionCents: number | null;
  status: "pending_review" | "cost_missing" | "calculated" | "adjusted";
  notes: string;
};

export function bellePurchaseCostFromExcelE(excelECents: number) {
  if (!Number.isInteger(excelECents) || excelECents < 0) {
    throw new Error("Excel column E must be a non-negative integer amount in cents.");
  }
  return Math.round(excelECents / 0.6);
}

export function draftSettlement(input: {
  commercialModel: "commission" | "wholesale" | "internal" | null;
  customerTotalCents: number;
  taxCents: number;
  shippingCents: number;
  processorFeeCents?: number | null;
  purchaseCostCents?: number | null;
  commissionBaseCents?: number | null;
  recordKind?: "sale" | "refund_adjustment";
}): SettlementDraft | null {
  if (input.commercialModel !== "commission" && input.commercialModel !== "wholesale") {
    return null;
  }

  const recordKind = input.recordKind ?? "sale";
  const shared = {
    commercialModel: input.commercialModel,
    recordKind,
    customerTotalCents: input.customerTotalCents,
    taxCents: input.taxCents,
    shippingCents: input.shippingCents,
    processorFeeCents: input.processorFeeCents ?? null,
  };

  if (input.commercialModel === "commission") {
    if (input.commissionBaseCents == null) {
      return {
        ...shared,
        ruleVersion: SETTLEMENT_RULE_VERSION.commission,
        purchaseCostCents: null,
        commissionBaseCents: null,
        commissionCents: null,
        status: "cost_missing",
        notes: "Confirmed supplier-price sales base is missing. Do not use Belle purchase cost, zero, or the customer selling price.",
      };
    }
    return {
      ...shared,
      ruleVersion: SETTLEMENT_RULE_VERSION.commission,
      purchaseCostCents: null,
      commissionBaseCents: input.commissionBaseCents,
      commissionCents: Math.round(input.commissionBaseCents * 0.15),
      status: recordKind === "refund_adjustment" ? "adjusted" : "calculated",
      notes: "Brow Arc commission is 15% of confirmed supplier-price sales. Tax, shipping, fees, and refunds are stored separately.",
    };
  }

  if (input.purchaseCostCents == null) {
    return {
      ...shared,
      ruleVersion: SETTLEMENT_RULE_VERSION.wholesale,
      purchaseCostCents: null,
      commissionBaseCents: null,
      commissionCents: null,
      status: "cost_missing",
      notes: "Belle purchase cost is missing. Derive unit cost as Excel E / 0.6 after verification. Do not treat unknown cost as profit.",
    };
  }

  return {
    ...shared,
    ruleVersion: SETTLEMENT_RULE_VERSION.wholesale,
    purchaseCostCents: input.purchaseCostCents,
    commissionBaseCents: null,
    commissionCents: null,
    status: recordKind === "refund_adjustment" ? "adjusted" : "calculated",
    notes: "Wholesale resale. Purchase cost stays independent from Brow Arc commission base.",
  };
}
