import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { INITIATIVE_EARLY_ACCESS_CTA } from "@/lib/product-messaging";

type InitiativePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: { icon: LucideIcon; title: string; description: string }[];
  steps?: { title: string; description: string }[];
  cta: { label: string; href: string; secondary?: { label: string; href: string } };
};

export function InitiativePage({
  eyebrow,
  title,
  description,
  highlights,
  steps,
  cta,
}: InitiativePageProps) {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{description}</p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  <h2 className="mt-4 font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {steps && steps.length > 0 && (
            <div className="mt-14">
              <h2 className="text-center text-2xl font-bold text-foreground">
                How it works
              </h2>
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
          )}

          <div className="mt-14 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-dark to-primary p-8 text-center text-white sm:p-10">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
              {INITIATIVE_EARLY_ACCESS_CTA}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={cta.href}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {cta.secondary && (
                <Link
                  href={cta.secondary.href}
                  className="text-sm font-semibold text-white/90 hover:text-white hover:underline"
                >
                  {cta.secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </SitePageLayout>
  );
}
