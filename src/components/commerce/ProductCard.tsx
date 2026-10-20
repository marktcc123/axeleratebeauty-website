import Link from "next/link";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductImage } from "@/components/commerce/ProductImage";
import { authorizedPriceLabel, publicPriceLabel } from "@/lib/commerce/guards";
import {
  productListBlurb,
  productPrimaryImage,
  productSpecLine,
} from "@/lib/commerce/product-presentation";
import type { Product, SessionContext } from "@/lib/types";
import { canPurchase } from "@/lib/types";

export function ProductCard({ product, session }: { product: Product; session: SessionContext }) {
  const approved = canPurchase(session);
  const image = productPrimaryImage(product);
  const detailHref = approved ? `/partner/catalog/${product.slug}` : `/professional-kits/${product.slug}`;
  const blurb = productListBlurb(product);

  return (
    <article className="flex h-full flex-col border border-sand-200 bg-white">
      <Link href={detailHref} className="block">
        <ProductImage src={image} alt={product.name} sizes="(max-width: 768px) 100vw, 360px" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="break-words font-serif text-2xl leading-snug text-ink">
          <Link href={detailHref}>{product.name}</Link>
        </h3>
        <p className="commerce-meta mt-2">{productSpecLine(product)}</p>
        {blurb ? <p className="mt-3 text-sm leading-relaxed text-muted">{blurb}</p> : null}
        <p className="commerce-price mt-4">
          {approved ? authorizedPriceLabel(product) : publicPriceLabel(product)}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
          <Link href={detailHref} className="text-sm underline-offset-4 hover:underline">
            Details
          </Link>
          {approved && product.professionalPriceCents != null ? (
            <AddToCartButton productId={product.id} productName={product.name} />
          ) : approved ? (
            <span className="text-sm text-muted">Price pending for this store</span>
          ) : (
            <Link href="/partner/login" className="text-sm text-muted">
              Login to purchase
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
