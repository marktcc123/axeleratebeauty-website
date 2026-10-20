import Link from "next/link";
import { Media } from "@/components/Media";
import { authorizedPriceLabel, publicPriceLabel } from "@/lib/commerce/guards";
import type { Product, SessionContext } from "@/lib/types";
import { canPurchase } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product, session }: { product: Product; session: SessionContext }) {
  const approved = canPurchase(session);
  const image = product.images[0] ?? "/images/product-line.webp";
  const detailHref = `/professional-kits/${product.slug}`;

  return (
    <article className="flex h-full flex-col border border-sand-200 bg-white">
      <Link href={detailHref} className="block bg-sand-50">
        <Media
          src={image}
          alt={product.name}
          width={800}
          height={800}
          sizes="(max-width: 768px) 100vw, 360px"
          className="aspect-square"
          imgClassName="h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{product.category.replaceAll("_", " ")}</p>
        <h3 className="mt-2 font-serif text-2xl text-ink">
          <Link href={detailHref}>{product.name}</Link>
        </h3>
        {product.intendedUse && <p className="mt-2 text-sm leading-relaxed text-muted">{product.intendedUse}</p>}
        <p className="mt-4 text-sm text-stone-deep">
          {approved ? authorizedPriceLabel(product) : publicPriceLabel(product)}
        </p>
        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          <Link href={detailHref} className="text-sm underline-offset-4 hover:underline">
            View Details
          </Link>
          {approved && product.professionalPriceCents != null ? (
            <AddToCartButton productId={product.id} />
          ) : approved ? (
            <span className="text-sm text-muted">Price pending for this store</span>
          ) : (
            <Link href="/partner/register" className="text-sm text-muted">
              Register to purchase
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
