export const SETTLEMENT_RULE_VERSION = {
  commission: "brow-arc-commission-v1",
  wholesale: "axelerate-wholesale-v1",
} as const;

export type SettlementDraft = {
  commercialModel: "commission" | "wholesale";
  ruleVersion: string;
  customerTotalCents: number;
  taxCents: number;
  shippingCents: number;
  processorFeeCents: number | null;
  supplierCostCents: number | null;
  commissionBaseCents: number | null;
  commissionCents: number | null;
  status: "pending_review" | "cost_missing" | "calculated";
  notes: string;
};

export function draftSettlement(input: {
  commercialModel: "commission" | "wholesale" | "internal" | null;
  customerTotalCents: number;
  taxCents: number;
  shippingCents: number;
  processorFeeCents?: number | null;
  supplierCostCents?: number | null;
}): SettlementDraft | null {
  if (input.commercialModel !== "commission" && input.commercialModel !== "wholesale") {
    return null;
  }

  const base = {
    commercialModel: input.commercialModel,
    customerTotalCents: input.customerTotalCents,
    taxCents: input.taxCents,
    shippingCents: input.shippingCents,
    processorFeeCents: input.processorFeeCents ?? null,
    supplierCostCents: input.supplierCostCents ?? null,
  };

  if (input.commercialModel === "commission") {
    if (input.supplierCostCents == null) {
      return {
        ...base,
        ruleVersion: SETTLEMENT_RULE_VERSION.commission,
        commissionBaseCents: null,
        commissionCents: null,
        status: "cost_missing",
        notes: "Supplier-price base is missing. Do not default to zero or the customer selling price.",
      };
    }
    return {
      ...base,
      ruleVersion: SETTLEMENT_RULE_VERSION.commission,
      commissionBaseCents: input.supplierCostCents,
      commissionCents: Math.round(input.supplierCostCents * 0.15),
      status: "calculated",
      notes: "15% of supplier-price sales. Tax, shipping, fees, and refunds are stored separately.",
    };
  }

  if (input.supplierCostCents == null) {
    return {
      ...base,
      ruleVersion: SETTLEMENT_RULE_VERSION.wholesale,
      commissionBaseCents: null,
      commissionCents: null,
      status: "cost_missing",
      notes: "Purchase cost is missing. Do not treat unknown cost as zero profit.",
    };
  }

  return {
    ...base,
    ruleVersion: SETTLEMENT_RULE_VERSION.wholesale,
    commissionBaseCents: null,
    commissionCents: null,
    status: "calculated",
    notes: "Wholesale resale. Sales, purchase cost, fees, and supplier payable are stored separately.",
  };
}
