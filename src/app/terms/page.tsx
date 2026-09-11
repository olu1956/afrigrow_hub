import type { Metadata } from "next";
import Link from "next/link";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export const metadata: Metadata = {
  title: "Terms of Service — AfriGrow Hub",
  description: "Terms of Service for AfriGrow Hub — founding membership, directory use, and acceptable use.",
};

const sections = [
  {
    title: "1. Who we are",
    content:
      "AfriGrow Hub (\"AfriGrow\", \"we\", \"us\") is a platform that helps African and Black-owned SMEs build a business profile, market their offer, match with other members, prepare for funding, and follow up with leads. These terms govern your use of afrigrow.app and related services.",
  },
  {
    title: "2. Founding membership",
    content:
      "During early access, founding members can join without a credit card and without a monthly fee. Founding access is not a promise of free use forever. Paid plans (currently expected at £10/month) may be introduced later. We will give reasonable notice before charging. You may cancel and delete your account at any time from Settings.",
  },
  {
    title: "3. Your account",
    content:
      "You must provide accurate information when you register. You are responsible for activity on your account and for keeping your password confidential. One business profile is created per account. You must not impersonate another business or list a company you do not control.",
  },
  {
    title: "4. Directory and verification",
    content:
      "A complete profile (40% strength or higher) can appear in the AfriGrow Business Directory so other members can find you. Listing is not a guarantee of customers. The Verified badge is granted only after AfriGrow reviews the evidence you submit. Unverified listings remain visible but labelled Unverified. We may unlist or remove a listing that is misleading, duplicate, abusive, or incomplete.",
  },
  {
    title: "5. What you publish",
    content:
      "Profile fields you choose to complete — name, description, logo, contact details, website, and social links — may be shown to other members in the directory and matching tools. CRM contacts, campaign drafts, funding figures, invoices, and verification documents stay private to your account and to AfriGrow admins who need them to operate the service. Do not upload content you do not have the right to use.",
  },
  {
    title: "6. AI tools",
    content:
      "Marketing, profile, matching, and funding suggestions are generated to help you work faster. They are not legal, financial, or professional advice. You remain responsible for checking AI output before you publish or send it.",
  },
  {
    title: "7. Acceptable use",
    content:
      "You must not use AfriGrow to spam members, harvest contact details, post unlawful or hateful content, attempt to access another account, or interfere with the platform. We may suspend or delete accounts that break these rules.",
  },
  {
    title: "8. Availability",
    content:
      "We aim to keep AfriGrow available, but we do not guarantee uninterrupted service. Features may change as we learn from founding members. We are not liable for lost business, lost data beyond our reasonable control, or decisions you make using the tools.",
  },
  {
    title: "9. Ending the agreement",
    content:
      "You can stop using AfriGrow and delete your account from Settings. We may close an account that breaches these terms or that we are required to close by law. After deletion, public directory listings are removed and private data is wiped from our systems, except records we must keep for legal or security reasons (for example a short audit of an admin action).",
  },
  {
    title: "10. Changes",
    content:
      "We may update these terms. Material changes will be announced by email or an in-app notice. Continued use after the change means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-muted">Last updated: 11 September 2026</p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{section.content}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Questions about these terms:{" "}
              <a href="mailto:info@afrigrow.app" className="font-semibold text-primary hover:underline">
                info@afrigrow.app
              </a>
              . See also our{" "}
              <Link href="/privacy" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SitePageLayout>
  );
}
