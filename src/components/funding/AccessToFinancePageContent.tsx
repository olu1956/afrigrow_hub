import Link from "next/link";
import { ArrowRight, LineChart, ShieldCheck, Wallet } from "lucide-react";
import { AccessToFinanceHero } from "@/components/funding/AccessToFinanceHero";
import { BecomeFundingPartnerStrip } from "@/components/funding/BecomeFundingPartnerStrip";
import { LabeledPartnerStrip } from "@/components/funding/LabeledPartnerStrip";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { accessToFinanceLabeledPartners } from "@/lib/landing/funding-partners";
import { EARLY_ACCESS_FOOTER } from "@/lib/product-messaging";

const highlights = [
  {
    icon: Wallet,
    title: "Grant & programme discovery",
    description:
      "Browse matched funding opportunities with country-aware recommendations in your dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Funding readiness score",
    description:
      "Complete guided checklists so your business looks credible before you apply.",
  },
  {
    icon: LineChart,
    title: "Honest apply flow",
    description:
      "Review programmes, prepare documents, then follow official external apply links.",
  },
];

const steps = [
  {
    title: "Build your business profile",
    description:
      "Funders trust complete profiles. Add your services, location, and credentials first.",
  },
  {
    title: "Check your readiness",
    description:
      "Work through the funding checklist — financial records, business plan, and compliance items.",
  },
  {
    title: "Apply with guidance",
    description:
      "Explore matched grants and programmes, then apply via the funder’s official site.",
  },
];

export function AccessToFinancePageContent() {
  return (
    <SitePageLayout>
      <AccessToFinanceHero />

      <LabeledPartnerStrip partners={accessToFinanceLabeledPartners} />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              What you get in the Finance Agent
            </h2>
            <p className="mt-3 text-muted">
              Phase 1 funding tools focus on discovery and preparation — not lending or
              application tracking inside AfriGrow Hub.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-14">
            <h2 className="text-center text-2xl font-bold text-foreground">How it works</h2>
            <ol className="mx-auto mt-8 grid max-w-3xl gap-4">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-14 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-dark to-primary p-8 text-center text-white sm:p-10">
            <h2 className="text-2xl font-bold">Ready to explore funding tools?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
              Join AfriGrow Hub free and open the Finance Agent in your dashboard.{" "}
              {EARLY_ACCESS_FOOTER}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login?redirect=%2Fdashboard%2Ffunding"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
              >
                Open Finance Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/join"
                className="text-sm font-semibold text-white/90 hover:text-white hover:underline"
              >
                Join free first
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BecomeFundingPartnerStrip />
    </SitePageLayout>
  );
}
