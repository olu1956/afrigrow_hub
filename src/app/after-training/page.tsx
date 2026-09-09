import type { Metadata } from "next";
import Link from "next/link";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { JoinNowButton } from "@/components/landing/JoinNowButton";
import { PostTrainingChecklist } from "@/components/training/PostTrainingChecklist";
import { FREE_LAUNCH_CTA_LINE } from "@/lib/product-messaging";

export const metadata: Metadata = {
  title: "After training — your next steps",
  description:
    "Five actions to take after AfriGrow Hub training: complete your profile, create a promo, check funding, add CRM contacts, and join the directory.",
};

export default function AfterTrainingPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            After the session
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Do these five things this week
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            You do not need to master the whole Hub tonight. Finish this short list and AfriGrow
            starts working for your business.
          </p>
          <p className="mt-3 text-sm text-muted">{FREE_LAUNCH_CTA_LINE}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <JoinNowButton size="lg" href="/signup" />
            <Link href="/login?redirect=%2Fdashboard%2Fnext-steps" className="text-sm font-semibold text-primary hover:underline">
              Already a member? Open the in-app checklist
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <PostTrainingChecklist loggedIn={false} />
        </div>
      </section>
    </SitePageLayout>
  );
}
