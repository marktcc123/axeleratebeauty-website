import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramDetail } from "@/components/programs/ProgramDetail";
import { getProgramBySlug, listPublishedPrograms } from "@/lib/program-catalog";

export function generateStaticParams() {
  return listPublishedPrograms().map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) return {};
  return {
    title: program.seoTitle,
    description: program.seoDescription,
    alternates: { canonical: `/professional-programs/${program.slug}` },
    openGraph: {
      title: program.seoTitle,
      description: program.seoDescription,
      images: [{ url: program.heroImage, alt: `${program.customerFacingName} product photography` }],
    },
  };
}

export default async function ProfessionalProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) notFound();
  return <ProgramDetail program={program} />;
}
