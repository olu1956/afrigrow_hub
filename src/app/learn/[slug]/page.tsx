import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GuideArticle } from "@/components/learning/GuideArticle";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { getGuideBySlugAction } from "@/lib/auth/guide-actions";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getGuideBySlugAction(slug);

  if (!result.ok || !result.guide) {
    return { title: "Guide not found — AfriGrow Hub" };
  }

  return {
    title: `${result.guide.title} — AfriGrow Hub`,
    description: result.guide.summary,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const result = await getGuideBySlugAction(slug);

  if (!result.ok || !result.guide) {
    notFound();
  }

  if (result.guide.slug !== slug) {
    redirect(`/learn/${result.guide.slug}`);
  }

  return (
    <SitePageLayout>
      <GuideArticle guide={result.guide} />
    </SitePageLayout>
  );
}
