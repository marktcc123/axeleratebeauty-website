"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { saveCartQuantities } from "@/app/actions/cart";
import { startCheckout, type CheckoutFormState } from "@/app/actions/checkout";
import { ProductImage } from "@/components/commerce/ProductImage";
import { QtyControl } from "@/components/commerce/QtyControl";
import { cartQuantitiesDirty } from "@/lib/cart-state";
import { formatMoney, formatPendingMoney } from "@/lib/commerce/guards";
import type { CartItem } from "@/lib/types";

export type CartEditorLine = {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPriceCents: number | null;
  outOfStock: boolean;
  imageSrc: string | null;
  specLine: string;
};

export function CartEditor({
  lines,
  checkoutReady,
  canCheckout,
}: {
  lines: CartEditorLine[];
  checkoutReady: boolean;
  canCheckout: boolean;
}) {
  const [items, setItems] = useState<CartEditorLine[]>(lines);
  const [savedItems, setSavedItems] = useState<CartItem[]>(
    lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const latestRef = useRef(items);
  const savedRef = useRef(savedItems);
  const saveTail = useRef(Promise.resolve());
  const saveAgain = useRef(false);
  const savingRef = useRef(false);
  const [checkoutState, checkoutAction, checkoutPending] = useActionState(
    startCheckout,
    { error: null } satisfies CheckoutFormState,
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    latestRef.current = items;
  }, [items]);

  function scheduleSave() {
    if (savingRef.current) {
      saveAgain.current = true;
      return;
    }
    saveTail.current = saveTail.current.then(runSave);
  }

  async function runSave() {
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      while (true) {
        saveAgain.current = false;
        const currentIds = new Set(latestRef.current.map((line) => line.productId));
        const snapshot = [
          ...latestRef.current.map((line) => ({ productId: line.productId, quantity: line.quantity })),
          ...savedRef.current
            .filter((item) => !currentIds.has(item.productId))
            .map((item) => ({ productId: item.productId, quantity: 0 })),
        ];
        let result;
        try {
          result = await saveCartQuantities(snapshot);
        } catch {
          setError("Unable to update the cart.");
          saveAgain.current = false;
          return;
        }
        if (result.error) {
          const rolledBack = result.items.flatMap((item) => {
            const meta =
              latestRef.current.find((line) => line.productId === item.productId) ??
              lines.find((line) => line.productId === item.productId);
            return meta ? [{ ...meta, quantity: item.quantity }] : [];
          });
          latestRef.current = rolledBack;
          savedRef.current = result.items;
          setItems(rolledBack);
          setSavedItems(result.items);
          setError(result.error);
          saveAgain.current = false;
          return;
        }
        savedRef.current = result.items;
        setSavedItems(result.items);
        const stillDirty = cartQuantitiesDirty(
          latestRef.current.map((line) => ({ productId: line.productId, quantity: line.quantity })),
          result.items,
        );
        if (saveAgain.current || stillDirty) continue;
        break;
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
      if (saveAgain.current) {
        saveAgain.current = false;
        saveTail.current = saveTail.current.then(runSave);
      }
    }
  }

  function changeQuantity(productId: string, nextQuantity: number) {
    const current = latestRef.current.find((line) => line.productId === productId);
    if (!current) return;
    const quantity = Math.max(0, Math.min(99, nextQuantity));
    const next =
      quantity < 1
        ? latestRef.current.filter((line) => line.productId !== productId)
        : latestRef.current.map((line) => (line.productId === productId ? { ...line, quantity } : line));
    latestRef.current = next;
    setItems(next);
    startTransition(() => {
      scheduleSave();
    });
  }

  const dirty = cartQuantitiesDirty(
    items.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    savedItems,
  );
  const missingPrice = items.some((line) => line.unitPriceCents == null);
  const outOfStock = items.some((line) => line.outOfStock);
  const subtotal = items.reduce((sum, line) => sum + (line.unitPriceCents ?? 0) * line.quantity, 0);
  const checkoutLocked =
    !canCheckout || !checkoutReady || missingPrice || outOfStock || dirty || saving || items.length === 0;

  if (items.length === 0) {
    return (
      <div className="mt-8 space-y-4">
        {error ? (
          <p className="text-sm text-accent-tac" role="alert">
            {error}
          </p>
        ) : null}
        <p className="text-muted">
          {canCheckout
            ? "Your cart is empty. Browse the authorized catalog to add products for this store."
            : "Your cart is empty. Purchasing unlocks after account approval."}
        </p>
        {canCheckout ? (
          <Link href="/partner/catalog" className="commerce-btn inline-flex">
            Open catalog
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="border-t border-sand-200">
        {items.map((line) => (
          <div key={line.productId} className="commerce-row !grid-cols-1 sm:!grid-cols-[4.5rem_minmax(0,1fr)_auto]">
            <ProductImage src={line.imageSrc} alt={line.name} sizes="72px" className="w-[4.5rem]" />
            <div className="min-w-0">
              <p className="break-words font-serif text-xl text-ink">{line.name}</p>
              <p className="commerce-meta mt-1">{line.specLine}</p>
              <p className="mt-2 text-sm tabular-nums text-stone-deep">
                {line.unitPriceCents != null
                  ? `${formatMoney(line.unitPriceCents)} each`
                  : "Authorized price is not available for the selected store."}
              </p>
              {line.unitPriceCents != null ? (
                <p className="text-sm font-medium tabular-nums text-stone-deep">
                  Line {formatMoney(line.unitPriceCents * line.quantity)}
                </p>
              ) : null}
              {line.outOfStock ? <p className="text-sm text-accent-tac">Currently unavailable.</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <QtyControl
                label={line.name}
                value={line.quantity}
                min={0}
                onChange={(next) => changeQuantity(line.productId, next)}
              />
              <button
                type="button"
                className="commerce-btn--ghost text-sm"
                onClick={() => changeQuantity(line.productId, 0)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="commerce-panel sticky bottom-3 z-10 space-y-2 text-sm text-stone-deep shadow-[0_-8px_24px_rgba(31,28,25,0.04)] sm:static sm:shadow-none">
        <div className="flex justify-between gap-4 tabular-nums">
          <span>Merchandise</span>
          <span>{missingPrice ? "incomplete" : formatMoney(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Shipping</span>
          <span>{formatPendingMoney(null, true)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Tax</span>
          <span>{formatPendingMoney(null, true)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-sand-200 pt-2 font-medium tabular-nums">
          <span>Amount due at checkout</span>
          <span>{formatPendingMoney(null, true)}</span>
        </div>
        {saving || dirty ? (
          <p className="text-muted">Saving quantity… Checkout stays locked until the cart is saved.</p>
        ) : (
          <p className="text-muted">Shipping and tax are calculated in Stripe Checkout, never assumed as free.</p>
        )}

        {error ? (
          <p className="text-sm text-accent-tac" role="alert">
            {error}
          </p>
        ) : null}
        {checkoutState.error ? (
          <p className="text-sm text-accent-tac" role="alert">
            {checkoutState.error}
          </p>
        ) : null}
        {missingPrice ? (
          <p className="text-muted">Checkout stays locked until every item has an authorized store price.</p>
        ) : null}
        {outOfStock ? <p className="text-muted">Remove unavailable items before checkout.</p> : null}

        {!canCheckout ? (
          <Link href="/partner/login" className="commerce-btn mt-2 inline-flex">
            Sign in with an approved account
          </Link>
        ) : !checkoutReady ? (
          <p className="text-muted">Checkout stays locked until Stripe tax and a shipping rate are configured.</p>
        ) : (
          <form action={checkoutAction} className="pt-2">
            <button className="commerce-btn w-full sm:w-auto" disabled={checkoutLocked || checkoutPending}>
              {checkoutPending ? "Opening secure checkout…" : "Checkout"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
