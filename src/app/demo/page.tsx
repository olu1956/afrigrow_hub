import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { JoinNowButton } from "@/components/landing/JoinNowButton";
import { DEMO_STEPS } from "@/lib/demo/tour";

export const metadata: Metadata = {
  title: "See how AfriGrow Hub works",
  description:
    "Walk the AfriGrow Hub product before you sign in — profile, directory, marketing, matching, funding, and CRM.",
};

export default function DemoMapPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Product tour
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            See how AfriGrow Hub works
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            A guided map of the product — no account needed. Nothing you click here
            is saved. Join free when you are ready to use it for your business.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/demo/profile"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              Start the tour
              <ArrowRight className="h-4 w-4" />
            </Link>
            <JoinNowButton size="md" href="/signup" />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground">Six stops. Two minutes.</h2>
            <p className="mt-3 text-muted">
              Open any stop, or walk them in order. This is sample data so you can see
              Verified and Unverified listings before you join.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.slug}>
                  <Link
                    href={`/demo/${step.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary transition group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {step.message}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Open this stop
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </SitePageLayout>
  );
}
