import type { Metadata } from "next";
import { Trust } from "@/components/Trust";
import { PageIntro } from "@/components/site/PageIntro";

export const metadata: Metadata = {
  title: "Real Partners",
  description: "Documented U.S. Dermabell partner implementation and brand materials for professional beauty businesses.",
  alternates: { canonical: "/success-stories" },
};

export default function SuccessStoriesPage() {
  return (
    <>
      <section className="bg-atmosphere px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <PageIntro eyebrow="Success Stories" title="Real U.S. implementation, not a concept.">
            <p>
              The photographs and awards below come from Dermabell partner materials and
              documented U.S. store work. Additional case-study claims will be added only
              when approved.
            </p>
          </PageIntro>
        </div>
      </section>
      <Trust />
    </>
  );
}
