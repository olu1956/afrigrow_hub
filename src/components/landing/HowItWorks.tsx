const audiences = [
  "Small businesses",
  "Traders & retailers",
  "Manufacturers",
  "Service providers",
  "Local vendors",
  "Event businesses",
  "Entrepreneurs",
];

const steps = [
  {
    step: "01",
    title: "Create your profile",
    description:
      "Sign up and let the Profile Agent build your professional business presence in minutes.",
  },
  {
    step: "02",
    title: "Activate AI agents",
    description:
      "Choose the agents you need — marketing, growth, matching, funding, or CRM.",
  },
  {
    step: "03",
    title: "Grow & connect",
    description:
      "Promote your business, solve pain points, match with partners, and automate follow-ups.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Who it&apos;s for
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for African businesses of every size
            </h2>
            <p className="mt-4 text-lg text-muted">
              Whether you run a shop in Lagos, manufacture in Accra, or organise
              events in Nairobi — AfriGrow Hub scales with you.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {audiences.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Three steps to smarter growth
            </h2>
            <ol className="mt-8 space-y-6">
              {steps.map((item) => (
                <li
                  key={item.step}
                  className="flex gap-5 rounded-2xl border border-border bg-card p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
