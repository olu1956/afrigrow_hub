import type { Metadata } from "next";
import { Globe2, Heart, Sprout, Users } from "lucide-react";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export const metadata: Metadata = {
  title: "About — AfriGrow Hub",
  description:
    "Learn about AfriGrow Hub — AI-powered growth tools built for African SMEs.",
};

const values = [
  {
    icon: Sprout,
    title: "Built for African businesses",
    description:
      "Designed around the realities of traders, retailers, manufacturers, and service providers across the continent.",
  },
  {
    icon: Users,
    title: "Connection over complexity",
    description:
      "We help businesses find buyers, suppliers, and partners — not just manage another dashboard.",
  },
  {
    icon: Globe2,
    title: "Local context, global ambition",
    description:
      "From Lagos to Nairobi, Accra to Johannesburg — tools that understand your market and your goals.",
  },
  {
    icon: Heart,
    title: "Growth that lasts",
    description:
      "Profiles, marketing, funding readiness, and CRM in one place so your business can scale sustainably.",
  },
];

export default function AboutPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            About us
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Empowering African SMEs to grow with confidence
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            AfriGrow Hub is an AI-powered platform that helps small and medium
            businesses build professional profiles, promote smarter, find the
            right connections, prepare for funding, and never miss a customer
            follow-up.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground">Our mission</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Too many African businesses have the talent, products, and drive to
              succeed — but lack the tools, visibility, and connections to scale.
              AfriGrow Hub brings specialist AI agents into one workspace so you
              can compete like a bigger team without the overhead.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              This is Phase 1 of our platform: a fully interactive UI/UX preview
              showing how traders, retailers, manufacturers, event businesses,
              and service providers can grow with intelligent automation.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </SitePageLayout>
  );
}
