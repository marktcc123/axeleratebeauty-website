import Link from "next/link";
import { redirect } from "next/navigation";
import { LocationSelect } from "@/components/commerce/LocationSelect";
import { ProductCard } from "@/components/commerce/ProductCard";
import { PageIntro } from "@/components/site/PageIntro";
import { listAuthorizedProducts } from "@/lib/catalog";
import { getSession } from "@/lib/session";

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
    const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query);
    const matchesCategory = !category || product.category === category;
    return matchesQuery && matchesCategory;
  });
  const categories = [...new Set(products.map((product) => product.category))];

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageIntro eyebrow="Replenishment" title="Authorized products for the selected store.">
          <p>Prices appear only for the approved store on this account. Empty results mean the catalog is not published yet, not a simulated warehouse.</p>
        </PageIntro>
        <div className="mt-6">
          <LocationSelect locations={session.locations} activeLocationId={session.activeLocationId} />
        </div>
        <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_12rem_auto]" action="/partner/catalog">
          <label className="text-sm" htmlFor="catalog-q">
            Search
            <input id="catalog-q" name="q" defaultValue={q} className="mt-1 w-full border border-sand-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm" htmlFor="catalog-category">
            Category
            <select id="catalog-category" name="category" defaultValue={category ?? ""} className="mt-1 w-full border border-sand-200 bg-white px-3 py-2">
              <option value="">All</option>
              {categories.map((value) => (
                <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
              ))}
            </select>
          </label>
          <button className="self-end bg-charcoal px-5 py-2 text-sm text-cream">Filter</button>
        </form>
        {session.verificationStatus !== "approved" ? (
          <p className="mt-10 text-muted">This catalog unlocks after the business account is approved.</p>
        ) : filtered.length === 0 ? (
          <p className="mt-10 text-muted">No matching published products are available for this store.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} session={session} />
            ))}
          </div>
        )}
        <Link href="/professional-programs" className="mt-10 inline-block text-sm underline-offset-4 hover:underline">
          Review professional program introductions
        </Link>
      </div>
    </section>
  );
}
