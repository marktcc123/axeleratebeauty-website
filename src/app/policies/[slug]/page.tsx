import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/site/PageIntro";

const pages = {
  shipping: {
    title: "Shipping Policy",
    body: "Domestic U.S. shipping methods, rates, and regions will be published after operations approval. This page is a placeholder and is not a final commercial term.",
  },
  returns: {
    title: "Return and Refund Policy",
    body: "Return windows, restocking rules, and refund handling will be published after legal and accounting review. This page is not a binding policy.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "A complete privacy notice must be supplied by the business before launch. This placeholder exists so navigation and registration can reference the page.",
  },
  terms: {
    title: "Terms of Sale",
    body: "Professional purchasing terms, warranty language, and authorized-distribution statements require business approval. Do not treat this page as final legal terms.",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) return { title: "Policy" };
  return {
    title: `${page.title} (Draft)`,
    description: "Draft policy placeholder. This page has not completed legal review.",
    robots: { index: false, follow: false },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];
  if (!page) notFound();

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <PageIntro eyebrow="Draft pending approval" title={page.title}>
          <p>{page.body}</p>
        </PageIntro>
      </div>
    </section>
  );
}
