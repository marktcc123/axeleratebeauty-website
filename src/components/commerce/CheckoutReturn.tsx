"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearPaidOrderFromCart } from "@/app/actions/cart";

const MAX_REFRESHES = 8;
const REFRESH_MS = 3000;

export function CheckoutReturn({
  kind,
  orderNumber,
}: {
  kind: "query_failed" | "missing" | "pending" | "paid" | "failed";
  orderNumber: string | null;
}) {
  const router = useRouter();
  const attemptedClear = useRef(false);
  const [attempts, setAttempts] = useState(0);
  const [clearError, setClearError] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== "pending" || !orderNumber || attempts >= MAX_REFRESHES) return;
    const timer = window.setTimeout(() => {
      setAttempts((current) => current + 1);
      router.refresh();
    }, REFRESH_MS);
    return () => window.clearTimeout(timer);
  }, [kind, orderNumber, attempts, router]);

  useEffect(() => {
    if (kind !== "paid" || !orderNumber || attemptedClear.current) return;
    attemptedClear.current = true;
    void clearPaidOrderFromCart(orderNumber).then((result) => {
      if (result.error) setClearError(result.error);
    });
  }, [kind, orderNumber]);

  const copy = {
    query_failed: "The confirmation page could not read this order. Reaching this URL does not mark an order paid.",
    missing: "This confirmation is only available to the signed-in account that placed the order.",
    pending: "Reaching this page does not mark an order paid. Status updates after Stripe sends a verified webhook.",
    paid: "The order is marked paid after a verified Stripe webhook. Purchased items from this checkout are removed from the cart only after this account is verified against the paid order.",
    failed: "No charge was captured for this order. You can return to the cart and try again.",
  }[kind];

  return (
    <div className="mt-8 space-y-4">
      <p className="text-stone-deep">
        Order {orderNumber ?? "unknown"}
        {kind === "pending" ? " · processing" : kind === "paid" ? " · paid" : kind === "failed" ? " · not completed" : ""}
      </p>
      <p className="text-muted">{copy}</p>
      {kind === "pending" && attempts < MAX_REFRESHES && (
        <p className="text-sm text-muted">Checking for confirmation… ({attempts + 1} of {MAX_REFRESHES})</p>
      )}
      {kind === "pending" && attempts >= MAX_REFRESHES && (
        <p className="text-sm text-muted">Still waiting for webhook confirmation. Refresh this page or open order history in a few minutes.</p>
      )}
      {clearError && <p className="text-sm text-accent-tac" role="alert">{clearError}</p>}
    </div>
  );
}
