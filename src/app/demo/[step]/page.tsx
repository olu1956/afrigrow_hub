import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { DemoStepPanels } from "@/components/demo/DemoStepPanels";
import { DemoTourChrome } from "@/components/demo/DemoTourChrome";
import { DEMO_STEPS, getDemoStep } from "@/lib/demo/tour";

type DemoStepPageProps = {
  params: Promise<{ step: string }>;
};

export function generateStaticParams() {
  return DEMO_STEPS.map((step) => ({ step: step.slug }));
}

export async function generateMetadata({
  params,
}: DemoStepPageProps): Promise<Metadata> {
  const { step: slug } = await params;
  const step = getDemoStep(slug);
  if (!step) {
    return { title: "Demo" };
  }
  return {
    title: `${step.title} demo`,
    description: step.caption,
  };
}

export default async function DemoStepPage({ params }: DemoStepPageProps) {
  const { step: slug } = await params;
  const step = getDemoStep(slug);
  if (!step) {
    notFound();
  }

  return (
    <SitePageLayout>
      <DemoTourChrome step={step}>
        <DemoStepPanels slug={step.slug} />
      </DemoTourChrome>
    </SitePageLayout>
  );
}
