import { describe, expect, it } from "vitest";
import { redactOrderLog } from "./order-log";

describe("order diagnostics", () => {
  it("keeps stage, codes, and association ids without secrets", () => {
    const log = redactOrderLog({
      stage: "orders_list",
      code: "42501",
      status: 400,
      organizationId: "org_1",
      orderNumber: "DB-TEST",
    });
    expect(log).toEqual({
      stage: "orders_list",
      code: "42501",
      status: 400,
      orderId: null,
      orderNumber: "DB-TEST",
      organizationId: "org_1",
    });
    expect(JSON.stringify(log)).not.toContain("sk_");
    expect(JSON.stringify(log)).not.toContain("cookie");
    expect(JSON.stringify(log)).not.toContain("@");
  });
});
