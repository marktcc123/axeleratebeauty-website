import { notFound } from "next/navigation";
import { CommercePage } from "@/components/commerce/CommercePage";
import { PartnerChrome } from "@/components/commerce/PartnerChrome";
import { ProductDetailView } from "@/components/commerce/ProductDetailView";
import { getAuthorizedProductsByIds, getProductsByIds, getPublishedProduct } from "@/lib/catalog";
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

  return (
    <>
      {session.userId ? <PartnerChrome session={session} /> : null}
      <CommercePage>
        <ProductDetailView
          product={product}
          approved={approved}
          related={related}
          backHref={approved ? "/partner/catalog" : undefined}
        />
      </CommercePage>
    </>
  );
}
