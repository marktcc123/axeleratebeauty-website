import { CartEditor } from "@/components/commerce/CartEditor";
import { CommerceHeader, CommercePage } from "@/components/commerce/CommercePage";
import { ShopProductCard } from "@/components/commerce/ShopProductCard";
import { UI_FIXTURE_CART_LINES, UI_FIXTURE_PRODUCTS } from "@/lib/commerce/ui-fixtures";

export const metadata = {
  robots: { index: false, follow: false },
  title: "UI fixtures (layout only)",
};

function fixturesEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_UI_FIXTURES === "1";
}

/**
 * Simulated layout verification only — not a purchasable catalog and not Zoho-backed.
 */
export default function UiFixturesPage() {
  if (!fixturesEnabled()) {
    return (
      <CommercePage narrow>
        <CommerceHeader eyebrow="Dev" title="UI fixtures disabled" />
        <p className="mt-4 text-sm text-muted">
          Set ENABLE_UI_FIXTURES=1 on Preview, or open this route in local development.
        </p>
      </CommercePage>
    );
  }

  return (
    <CommercePage>
      <div className="mb-8 border border-accent-tac/40 bg-sand-50 px-4 py-3 text-sm text-stone-deep">
        Simulated layout verification — fixture data is not a real catalog, not production, and not Zoho.
      </div>
      <CommerceHeader
        eyebrow="Fixtures"
        title="Commerce layout stress cases"
        description="Long names, missing images, out of stock, missing price, and multi-line cart."
      />

      <h2 className="mt-10 font-serif text-2xl text-ink">Shop grid (simulated)</h2>
      <div className="commerce-grid mt-6">
        {UI_FIXTURE_PRODUCTS.map((product) => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>

      <h2 className="mt-14 font-serif text-2xl text-ink">Empty search</h2>
      <p className="mt-3 text-muted">No products match this search. Clear filters to see the full authorized list.</p>

      <h2 className="mt-14 font-serif text-2xl text-ink">Cart density</h2>
      <CartEditor lines={UI_FIXTURE_CART_LINES} checkoutReady={false} canCheckout />
    </CommercePage>
  );
}
