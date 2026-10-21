import Link from "next/link";
import { redirect } from "next/navigation";
import { CommerceHeader, CommercePage } from "@/components/commerce/CommercePage";
import { ShopProductCard } from "@/components/commerce/ShopProductCard";
import { withBrandPresentation } from "@/data/brand-content";
import { listAuthorizedProducts } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function PartnerCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const { q, category } = await searchParams;
  const products = (await listAuthorizedProducts(session)).map(withBrandPresentation);
  const query = (q ?? "").trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesQuery =
      !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    const matchesCategory = !category || product.category === category;
    return matchesQuery && matchesCategory;
  });
  const categories = [...new Set(products.map((product) => product.category))];
  const approved = canPurchase(session);

  return (
    <CommercePage>
      <CommerceHeader title="Shop" description="Search products and add what you need." />

      <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_11rem_auto]" action="/partner/catalog">
        <label className="text-sm text-muted" htmlFor="catalog-q">
          Search products
          <input
            id="catalog-q"
            name="q"
            defaultValue={q}
            placeholder="Name or SKU"
            className="commerce-field mt-1"
          />
        </label>
        <label className="text-sm text-muted" htmlFor="catalog-category">
          Category
          <select
            id="catalog-category"
            name="category"
            defaultValue={category ?? ""}
            className="commerce-field mt-1"
          >
            <option value="">All</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button className="commerce-btn self-end">Search</button>
      </form>

      {!approved ? (
        <p className="mt-10 text-muted">
          {!session.emailVerified
            ? "Confirm your email to see your prices and shop."
            : session.verificationStatus === "suspended"
              ? "Purchasing is paused on this account. Open Account for support."
              : session.verificationStatus === "pending"
                ? "This account is still waiting for access. Contact support if you expected to shop already."
                : session.locations.length === 0
                  ? "A shipping location is required before you can shop."
                  : "Purchasing is not available for this account yet."}
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-muted">
          {query || category
            ? "No products match this search. Clear filters to see your full list."
            : "No products are available yet."}
        </p>
      ) : (
        <div className="commerce-grid mt-10">
          {filtered.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/cart" className="underline-offset-4 hover:underline">
          View cart
        </Link>
        <Link href="/partner/orders" className="underline-offset-4 hover:underline">
          Orders
        </Link>
      </div>
    </CommercePage>
  );
}
