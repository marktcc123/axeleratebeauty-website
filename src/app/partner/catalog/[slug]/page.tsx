import { redirect, notFound } from "next/navigation";
import { CommercePage } from "@/components/commerce/CommercePage";
import { ProductDetailView } from "@/components/commerce/ProductDetailView";
import { withBrandPresentation } from "@/data/brand-content";
import { getAuthorizedProductsByIds, getProductsByIds, getPublishedProduct } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function PartnerProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");

  const { slug } = await params;
  const published = await getPublishedProduct(slug);
  if (!published) notFound();

  const approved = canPurchase(session);
  const [priced] = approved
    ? await getAuthorizedProductsByIds([published.id], session)
    : [published];
  const product = withBrandPresentation(priced ?? published);
  const related = await getProductsByIds(product.relatedProductIds);

  return (
    <CommercePage>
      <ProductDetailView
        product={product}
        approved={approved}
        related={related}
        backHref="/partner/catalog"
        brandResources={product.brandResources}
      />
    </CommercePage>
  );
}
