import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_GROWTH_EARLY_ACCESS, PRICING_SUBTITLE } from "@/lib/product-messaging";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "to get started",
    description: "Perfect for new businesses testing the platform.",
    features: [
      "Business profile",
      "1 AI agent",
      "Basic marketplace listing",
      "5 CRM contacts",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "Free",
    period: "during early access",
    description: "All Growth features unlocked while we test the market with real SMEs.",
    features: [
      "All 6 AI agents",
      "Unlimited marketing content",
      "Priority matching",
      "Funding readiness tools",
      "Full CRM & automation",
      PRICING_GROWTH_EARLY_ACCESS,
    ],
    cta: "Join free",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For manufacturers, chains, and event companies at scale.",
    features: [
      "Multi-location profiles",
      "Dedicated agent tuning",
      "API & integrations",
      "Team seats & roles",
      "Priority support",
    ],
    cta: "Contact us",
    highlighted: false,
  },
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="border-t border-border bg-card px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Plans that grow with your business
          </h2>
          <p className="mt-4 text-lg text-muted">{PRICING_SUBTITLE}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-7 ${
                plan.highlighted
                  ? "border-primary bg-primary text-white shadow-xl shadow-primary/20"
                  : "border-border bg-background"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${plan.highlighted ? "text-white" : "text-foreground"}`}
              >
                {plan.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span
                  className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted"}`}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={`mt-3 text-sm ${plan.highlighted ? "text-white/80" : "text-muted"}`}
              >
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-accent" : "text-primary"}`}
                    />
                    <span className={plan.highlighted ? "text-white/90" : "text-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={
                  plan.name === "Enterprise"
                    ? "/contact?plan=enterprise&source=pricing"
                    : "/signup"
                }
                className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
