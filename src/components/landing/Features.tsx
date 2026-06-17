import {
  Building2,
  Megaphone,
  Puzzle,
  Users,
  Wallet,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Professional business profiles",
    description:
      "Showcase your brand, services, location, and credentials so buyers trust you from the first click.",
  },
  {
    icon: Megaphone,
    title: "AI marketing & promotion",
    description:
      "Generate social posts, WhatsApp promos, flyers, and campaigns tailored to your business and audience.",
  },
  {
    icon: Puzzle,
    title: "Pain-point solutions",
    description:
      "Identify growth blockers — inventory, pricing, visibility — and get actionable AI recommendations.",
  },
  {
    icon: Users,
    title: "Business matching",
    description:
      "Connect with buyers, suppliers, partners, and event clients across categories and regions.",
  },
  {
    icon: Wallet,
    title: "Grants & funding readiness",
    description:
      "Discover opportunities and build a funding-ready profile with checklists and document guidance.",
  },
  {
    icon: MessageSquare,
    title: "Customer follow-up CRM",
    description:
      "Automate reminders, track enquiries, and never lose a lead after a sale or event.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One platform for growth, promotion & connection
          </h2>
          <p className="mt-4 text-lg text-muted">
            Built for African SMEs — from market traders to manufacturers and
            event businesses.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-background p-6 transition hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary transition group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
