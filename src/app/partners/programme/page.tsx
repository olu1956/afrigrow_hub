import type { Metadata } from "next";
import Link from "next/link";
import { Check, Handshake } from "lucide-react";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export const metadata: Metadata = {
  title: "Partner Programme — AfriGrow Hub",
  description:
    "AfriGrow Partner Programme tiers, member offers, and partnership terms for brands serving African SMEs.",
};

const tiers = [
  {
    name: "Community",
    bestFor: "Diaspora orgs, charities, local networks, mutual promo",
    fee: "Usually £0",
    features: [
      "Partners page card",
      "No homepage marquee",
      "Optional mutual shout-out",
      "Member value or co-marketing",
    ],
  },
  {
    name: "Featured",
    bestFor: "Apps, SaaS, and services with a clear member offer",
    fee: "Small fee or affiliate",
    highlighted: true,
    features: [
      "Priority partners page card",
      "Homepage logo marquee",
      "1 newsletter mention / quarter",
      "Exclusive offer + fee or rev-share",
    ],
  },
  {
    name: "Premium",
    bestFor: "National brands, fintech, insurers, large SaaS",
    fee: "Sponsorship + / or rev-share",
    features: [
      "Top partners page placement",
      "Lead marquee position",
      "Dedicated campaign / webinar",
      "In-product promo slot",
    ],
  },
];

const expectations = [
  {
    title: "Member-exclusive offer",
    text: "Discount, extended trial, free consult, or priority access — redeemable only via AfriGrow (promo code or unique link).",
  },
  {
    title: "Logo + short copy",
    text: "Approved brand assets and a 1–2 sentence description for the partners page.",
  },
  {
    title: "Tracking",
    text: "Unique URL, promo code, or referral ID — required for Featured and Premium.",
  },
  {
    title: "Co-promotion",
    text: "At least one mention when listed; Premium partners keep a quarterly cadence.",
  },
  {
    title: "Offer validity",
    text: "Keep the member offer live for the agreement term; give 30 days’ notice before changes.",
  },
];

const exampleOffers = [
  {
    type: "Lifestyle app",
    offer: "30 days free Pro / extended trial",
    tier: "Featured",
    model: "Affiliate on upgrades",
  },
  {
    type: "Events app",
    offer: "20% off first Plus/Pro year, or free month",
    tier: "Featured",
    model: "Affiliate on upgrades",
  },
  {
    type: "Accounting / SaaS",
    offer: "3 months free or 25% off year 1",
    tier: "Featured → Premium",
    model: "Sponsorship + trial",
  },
  {
    type: "Payments / fintech",
    offer: "Waived setup + preferential rates (12 months)",
    tier: "Premium",
    model: "Sponsorship or rev-share",
  },
  {
    type: "Training / HR",
    offer: "Free seat on a flagship course each quarter",
    tier: "Featured",
    model: "Fee + co-hosted webinar",
  },
  {
    type: "Community / diaspora",
    offer: "Joint event, referrals, or member webinar",
    tier: "Community",
    model: "Co-marketing (no fee)",
  },
];

const agreementBullets = [
  "Term — 12 months from go-live; auto-renew unless either party gives 30 days’ written notice.",
  "Placement — AfriGrow assigns Community / Featured / Premium based on offer strength and inventory.",
  "Member offer — Partner warrants the advertised exclusive stays available via the agreed code or link.",
  "Creative approval — AfriGrow may edit copy for length; Partner approves logo and legal name use at onboarding.",
  "Fees — Cash fees waived during early access unless agreed. Featured/Premium fees apply when SME billing is live.",
  "Affiliate / reporting — Partner shares monthly conversion counts for the AfriGrow code/link where rev-share applies.",
  "Brand use — Each party may use the other’s name and logo solely to promote the partnership.",
  "No exclusivity (default) — Category exclusivity is available only on Premium by written rider.",
  "Conduct — Offers must be lawful and accurate; AfriGrow may pause a listing for material breach or reputational risk.",
  "Data — No sale of member personal data; each party handles leads under its own privacy policy.",
  "Independence — Not a joint venture; each party remains responsible for its own products and support.",
  "Termination — 30 days’ notice for convenience, or immediate for uncured material breach after 14 days.",
];

const faqs = [
  {
    q: "Do we pay during free early access?",
    a: "Usually no, if the exclusive member offer (or Community co-promo) is in place. Paid sponsorship starts when AfriGrow charges members — or earlier by mutual agreement for Premium brands that want guaranteed inventory.",
  },
  {
    q: "Can we be listed with only a logo?",
    a: "No. Every Partner badge needs member value or approved Community co-marketing.",
  },
  {
    q: "What if our offer changes?",
    a: "Give 30 days’ notice so AfriGrow can update the card; material reductions may trigger a tier review.",
  },
];

export default function PartnerProgrammePage() {
  return (
    <SitePageLayout>
      <section className="border-b border-primary-dark/20 bg-primary-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Partners
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-accent sm:text-5xl lg:text-6xl">
            Partner Programme
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Reach African SME founders when they are building, promoting, and
            choosing tools. Every featured partner gives AfriGrow members a
            benefit they cannot get on the public website — sponsorship and
            revenue share sit on top when billing is live.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/partners/become-a-partner"
              className="inline-flex rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
            >
              Apply to partner
            </Link>
            <Link
              href="/partners"
              className="inline-flex rounded-md border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              View partners
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Programme tiers</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            During founding early access, cash fees are usually waived if the
            member offer is live. Featured and Premium fees activate with AfriGrow
            Growth billing (~£10/month for members).
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {tiers.map((tier) => (
              <article
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-6 shadow-sm ${
                  tier.highlighted
                    ? "border-primary bg-primary-light/50 ring-1 ring-primary/20"
                    : "border-border bg-card"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {tier.highlighted ? "Most common" : "Tier"}
                </p>
                <h3 className="mt-2 text-xl font-bold text-foreground">{tier.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tier.bestFor}</p>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  When billing is live: <span className="text-primary">{tier.fee}</span>
                </p>
                <ul className="mt-5 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm text-muted">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            What we expect from partners
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Community partners without a commercial product may substitute events,
            referrals, or content — still subject to approval.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expectations.map((item, index) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Example offers</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Use these as templates when pitching or filling the application form.
            AfriGrow ecosystem apps may hold Featured placement with cross-promotion
            and optional affiliate — no cash sponsorship required.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-primary-dark text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Partner type</th>
                  <th className="px-4 py-3 font-semibold">Example member offer</th>
                  <th className="px-4 py-3 font-semibold">Tier</th>
                  <th className="px-4 py-3 font-semibold">Model</th>
                </tr>
              </thead>
              <tbody>
                {exampleOffers.map((row) => (
                  <tr key={row.type} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{row.type}</td>
                    <td className="px-4 py-3 text-muted">{row.offer}</td>
                    <td className="px-4 py-3 text-muted">{row.tier}</td>
                    <td className="px-4 py-3 text-muted">{row.model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Handshake className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Agreement bullets
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Non-binding summary for discussion. A short written agreement follows
                acceptance.
              </p>
            </div>
          </div>

          <ol className="mt-8 space-y-3">
            {agreementBullets.map((bullet, index) => (
              <li
                key={bullet}
                className="flex gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-muted"
              >
                <span className="font-bold text-primary">{index + 1}.</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-background px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Quick FAQ</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-primary-light/40 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Ready to apply?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Submit your company details and proposed member offer. We review within
            5 business days and propose a tier.
          </p>
          <Link
            href="/partners/become-a-partner"
            className="mt-6 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
          >
            Become a partner
          </Link>
          <p className="mt-4 text-xs text-muted">
            Partner Programme v1.0 · For discussion — not a signed contract until
            countersigned.
          </p>
        </div>
      </section>
    </SitePageLayout>
  );
}
