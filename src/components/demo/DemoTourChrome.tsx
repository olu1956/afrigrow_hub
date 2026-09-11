import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { JoinNowButton } from "@/components/landing/JoinNowButton";
import {
  DEMO_STEPS,
  type DemoStep,
  getAdjacentDemoSteps,
} from "@/lib/demo/tour";

type DemoTourChromeProps = {
  step: DemoStep;
  children: React.ReactNode;
};

export function DemoTourChrome({ step, children }: DemoTourChromeProps) {
  const { index, prev, next } = getAdjacentDemoSteps(step.slug);

  return (
    <div className="border-b border-border bg-primary-light/30">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Product tour · {index + 1} of {DEMO_STEPS.length}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {step.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {step.caption}
            </p>
          </div>
          <JoinNowButton size="sm" href="/signup" className="shrink-0 self-start" />
        </div>

        <nav
          aria-label="Demo steps"
          className="mt-6 flex gap-2 overflow-x-auto pb-1"
        >
          {DEMO_STEPS.map((item, stepIndex) => {
            const active = item.slug === step.slug;
            const done = stepIndex < index;
            return (
              <Link
                key={item.slug}
                href={`/demo/${item.slug}`}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-white"
                    : done
                      ? "bg-primary-light text-primary"
                      : "border border-border bg-card text-muted hover:text-foreground"
                }`}
              >
                {stepIndex + 1}. {item.shortLabel}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-primary/15 bg-card px-4 py-3 text-sm font-medium text-foreground">
            {step.message}
          </p>
          {children}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {prev ? (
              <Link
                href={`/demo/${prev.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {prev.shortLabel}
              </Link>
            ) : (
              <Link
                href="/demo"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Tour map
              </Link>
            )}
            {next ? (
              <Link
                href={`/demo/${next.slug}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Next: {next.shortLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <JoinNowButton size="md" href="/signup" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
