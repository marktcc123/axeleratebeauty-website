import Link from "next/link";
import { redirect } from "next/navigation";
import { ReplenishmentRow } from "@/components/commerce/ReplenishmentRow";
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
  const products = await listAuthorizedProducts(session);
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
    <section className="bg-cream px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Catalog</p>
          <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Reorder for the selected store</h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Prices are for your authorized store only. Search by name or SKU when the catalog grows.
          </p>
        </header>

        <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_11rem_auto]" action="/partner/catalog">
          <label className="text-sm text-muted" htmlFor="catalog-q">
            Search name or SKU
            <input
              id="catalog-q"
              name="q"
              defaultValue={q}
              className="mt-1 w-full border border-sand-200 bg-white px-3 py-2 text-stone-deep"
            />
          </label>
          <label className="text-sm text-muted" htmlFor="catalog-category">
            Category
            <select
              id="catalog-category"
              name="category"
              defaultValue={category ?? ""}
              className="mt-1 w-full border border-sand-200 bg-white px-3 py-2 text-stone-deep"
            >
              <option value="">All</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <button className="self-end bg-charcoal px-5 py-2 text-sm text-cream">Apply</button>
        </form>

        {!approved ? (
          <p className="mt-10 text-muted">Purchasing unlocks after this business account is approved.</p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-muted">
            {query || category
              ? "No products match this search. Clear filters to see the full authorized list."
              : "No published products are available for this store yet."}
          </p>
        ) : (
          <div className="mt-6 border-t border-sand-200">
            {filtered.map((product) => (
              <ReplenishmentRow key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/cart" className="underline-offset-4 hover:underline">
            Review cart
          </Link>
          <Link href="/partner/orders" className="underline-offset-4 hover:underline">
            Past orders
          </Link>
        </div>
      </div>
    </section>
  );
}
