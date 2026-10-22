import Link from "next/link";
import { redirect } from "next/navigation";
import { CommerceHeader, CommercePage } from "@/components/commerce/CommercePage";
import { ShopProductCard } from "@/components/commerce/ShopProductCard";
import { listAuthorizedProducts } from "@/lib/catalog";
import { productBarcodes } from "@/lib/catalog-browse";
import { getSession } from "@/lib/session";

const PAGE_SIZE = 24;

const CATEGORY_ORDER = [
  "Cleansers",
  "Toners",
  "Essences & Solutions",
  "Creams & Emulsions",
  "Masks",
  "Peels",
  "Other",
];

export default async function PartnerCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");
  const { q, category, page: pageRaw } = await searchParams;
  const products = await listAuthorizedProducts(session);
  const query = (q ?? "").trim().toLowerCase();
  const filtered = products.filter((product) => {
    const barcodes = productBarcodes(product).join(" ");
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      barcodes.includes(query);
    const matchesCategory = !category || product.category === category;
    return matchesQuery && matchesCategory;
  });

  const categories = CATEGORY_ORDER.filter((value) => products.some((product) => product.category === value));
  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const qs = (next: { q?: string; category?: string; page?: number }) => {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextCategory = next.category ?? category;
    const nextPage = next.page ?? currentPage;
    if (nextQ) params.set("q", nextQ);
    if (nextCategory) params.set("category", nextCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    const value = params.toString();
    return value ? `/partner/catalog?${value}` : "/partner/catalog";
  };

  return (
    <CommercePage>
      <CommerceHeader title="Shop" description="Browse professional products by name, barcode, or category." />

      <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_14rem_auto]" action="/partner/catalog">
        <label className="text-sm text-muted" htmlFor="catalog-q">
          Search products
          <input
            id="catalog-q"
            name="q"
            defaultValue={q}
            placeholder="Name or barcode"
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
                {value}
              </option>
            ))}
          </select>
        </label>
        <button className="commerce-btn self-end">Search</button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {filtered.length} product{filtered.length === 1 ? "" : "s"}
        {query || category ? " match" : ""}
      </p>

      {pageItems.length === 0 ? (
        <p className="mt-10 text-muted">
          {query || category
            ? "No products match this search. Clear filters to see the full list."
            : "No products are available yet."}
        </p>
      ) : (
        <div className="commerce-grid mt-8">
          {pageItems.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <nav className="mt-10 flex flex-wrap items-center gap-4 text-sm" aria-label="Catalog pages">
          {currentPage > 1 ? (
            <Link href={qs({ page: currentPage - 1 })} className="underline-offset-4 hover:underline">
              Previous
            </Link>
          ) : null}
          <span className="text-muted">
            Page {currentPage} of {pageCount}
          </span>
          {currentPage < pageCount ? (
            <Link href={qs({ page: currentPage + 1 })} className="underline-offset-4 hover:underline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}

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
