import Link from "next/link";

export function BecomeFundingPartnerStrip() {
  return (
    <section className="border-t border-border bg-[#eef1f0] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-base font-bold uppercase leading-snug tracking-wide text-primary-dark sm:text-lg">
          Want to become one of our funding partners?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          If you offer grants, loans, or SME finance tools, partner with AfriGrow Hub to
          reach businesses getting funding-ready on the platform.
        </p>
        <Link
          href="/partners/become-a-partner"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary to-accent px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-primary/20 transition hover:opacity-95"
        >
          Click here
        </Link>
      </div>
    </section>
  );
}
