import { ProductCard } from "@/components/commerce/ProductCard";
import { PageIntro } from "@/components/site/PageIntro";
import { listPublishedProducts } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function ProfessionalKitsPage() {
  const [products, session] = await Promise.all([listPublishedProducts(), getSession()]);

  return (
    <section className="bg-cream px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <PageIntro eyebrow="Professional Kits" title="Professional Korean skincare packages for existing treatment businesses.">
          <p>
            These packages are intended for licensed professionals where required, estheticians,
            and approved wholesale accounts. Public visitors may review published information.
            Sign in to shop published products at your business price. Public pages do not show professional dollars.
          </p>
        </PageIntro>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/partner/register" className="bg-charcoal px-5 py-3 text-cream">Create a Business Account</Link>
          <Link href="/full-salon-system" className="underline-offset-4 hover:underline">Looking for the Full Salon System?</Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-16 border border-sand-200 bg-white p-8">
            <h2 className="font-serif text-2xl text-ink">Products coming soon</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Published products will appear here after an administrator marks them Active.
              Draft products are never shown or sold.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} session={session} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
