import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { Media } from "@/components/Media";
import { getAuthorizedProductsByIds, getProductsByIds, getPublishedProduct } from "@/lib/catalog";
import { authorizedPriceLabel, publicPriceLabel } from "@/lib/commerce/guards";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const published = await getPublishedProduct(slug);
  if (!published) notFound();

  const session = await getSession();
  const approved = canPurchase(session);
  const [priced] = approved
    ? await getAuthorizedProductsByIds([published.id], session)
    : [published];
  const product = priced ?? published;
  const related = await getProductsByIds(product.relatedProductIds);
  const image = product.images[0] ?? "/images/product-line.webp";

  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <Media src={image} alt={product.name} width={1000} height={1000} sizes="(max-width: 1024px) 100vw, 560px" className="bg-sand-50" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{product.sku}</p>
          <h1 className="mt-3 font-serif text-4xl text-ink">{product.name}</h1>
          <p className="mt-4 text-lg text-muted">{product.description}</p>
          <p className="mt-6 text-stone-deep">
            {approved ? authorizedPriceLabel(product) : publicPriceLabel(product)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Availability: {product.inventoryStatus.replaceAll("_", " ")}
          </p>
          <div className="mt-8">
            {approved && product.professionalPriceCents != null ? (
              <AddToCartButton productId={product.id} allowQuantity />
            ) : approved ? (
              <p className="text-sm text-muted">Price pending for this store. Purchasing is unavailable until a valid tier price is assigned.</p>
            ) : (
              <Link href="/partner/register" className="inline-block bg-charcoal px-5 py-3 text-sm text-cream">
                Register or log in to purchase
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl text-ink">Professional use</h2>
          <p className="mt-3 text-muted">{product.intendedUse ?? "Approved professional-use notes will appear here."}</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-ink">Package contents</h2>
          {product.contents.length === 0 ? (
            <p className="mt-3 text-muted">SKU quantities will be listed after they are approved.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-muted">
              {product.contents.map((item) => (
                <li key={`${item.sku}-${item.name}`}>
                  {item.name}
                  {item.quantity ? ` · ${item.quantity}` : ""}
                  {item.sku ? ` · ${item.sku}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-serif text-2xl text-ink">Usage</h2>
          <p className="mt-3 text-muted">{product.usageNotes ?? "Linked documentation will be added when approved."}</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-ink">Precautions</h2>
          <p className="mt-3 text-muted">{product.precautions ?? "Only approved precautions will be published."}</p>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl">
        <h2 className="font-serif text-2xl text-ink">Questions</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Product-specific FAQs will appear here after they are approved. For purchasing or
          professional-use questions, contact partner support.
        </p>
        <Link href="/contact" className="mt-4 inline-block text-sm underline-offset-4 hover:underline">
          Contact partner support
        </Link>
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-6xl">
          <h2 className="font-serif text-2xl text-ink">Related approved products</h2>
          <div className="mt-4 flex flex-col gap-2">
            {related.map((item) => (
              <Link key={item.id} href={`/professional-kits/${item.slug}`} className="underline-offset-4 hover:underline">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
