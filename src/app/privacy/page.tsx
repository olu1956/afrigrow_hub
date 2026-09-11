import type { Metadata } from "next";
import Link from "next/link";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — AfriGrow Hub",
  description: "How AfriGrow Hub collects, uses, and protects your business and personal data.",
};

const sections = [
  {
    title: "1. Overview",
    content:
      "AfriGrow Hub (\"we\", \"us\") provides tools for African and Black-owned SMEs. This policy explains what we collect, why, who we share it with, and how you can control it. We do not sell your personal data.",
  },
  {
    title: "2. Information we collect",
    content:
      "Account details: name, login email, country, and password (stored by our auth provider). Business profile: trading name, description, logo, location, products and services, website, WhatsApp, and social links. Private workspace data you create: CRM contacts, campaign drafts, matching activity, funding readiness answers, invoices, quotations, and training enrolments. Verification evidence: registration number and any document you upload for the Verified badge. Technical data: browser type, device, and (only if you accept analytics) a visit cookie so we can count unique visitors.",
  },
  {
    title: "3. How we use it",
    content:
      "We use this information to run your account, show your listing to other members when you qualify, generate AI suggestions, match you with relevant businesses, send service email (welcome, training follow-up, password reset), review verification requests, and keep the platform secure. Founding-member billing is not charged today; if paid plans start we will use payment processors only for that purpose.",
  },
  {
    title: "4. What other members can see",
    content:
      "Directory and matching show the profile fields you choose to publish: business name, logo, description, category, location, services, public contact details, and whether you are Verified. CRM contacts, revenue and funding amounts, campaign drafts, invoices, and verification documents are not shown to other members. You can hide your listing from Settings at any time. An AfriGrow admin may also unlist a listing for moderation.",
  },
  {
    title: "5. Who we share it with",
    content:
      "We share data with the service providers that host AfriGrow: Supabase (database, authentication, and file storage), Vercel (website hosting), and Resend (transactional email from send.afrigrow.app). If we add card payments later, Stripe or a similar processor will receive billing details. We may disclose information if required by law. We do not share CRM or funding data with other members or with advertisers.",
  },
  {
    title: "6. Storage and security",
    content:
      "Data is stored in the EU/UK-accessible infrastructure of our providers, with encryption in transit and access controls. Passwords are handled by Supabase Auth, not stored in AfriGrow application tables. Verification documents sit in a private storage bucket. Row Level Security means members can only read their own private records. Platform admins can access directory records to verify, unlist, or remove accounts.",
  },
  {
    title: "7. How long we keep it",
    content:
      "We keep your account and workspace data while your membership is active. If you delete your account, we remove your profile, business listing, CRM, campaigns, and related rows. Email logs and legal records may be kept for a limited period where we must. Visitor analytics keys (if you consented) expire after 12 months.",
  },
  {
    title: "8. Your rights",
    content:
      "You can access and correct your profile in the dashboard, download a copy of your data from Settings, hide your directory listing, or delete your account. You may also email info@afrigrow.app to object to certain processing. Where UK GDPR or similar law applies, you can complain to your data protection authority.",
  },
  {
    title: "9. Cookies",
    content:
      "Essential cookies keep you signed in and remember cookie preferences. They are required for the service. The afrigrow_vid analytics cookie is set only after you choose “Accept analytics” on the cookie banner. It counts unique visits so we can show public visit totals. You can change this anytime via Cookie preferences in the footer. We do not use advertising cookies.",
  },
  {
    title: "10. Children",
    content:
      "AfriGrow is for businesses. It is not directed at children under 16. If you believe a child has created an account, contact us and we will delete it.",
  },
  {
    title: "11. Changes",
    content:
      "We may update this policy. Significant changes will be notified by email or an in-app notice before they take effect.",
  },
];

export default function PrivacyPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
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
            <h2 className="text-lg font-semibold text-foreground">12. Contact us</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Privacy questions:{" "}
              <a href="mailto:info@afrigrow.app" className="font-semibold text-primary hover:underline">
                info@afrigrow.app
              </a>
              . Related:{" "}
              <Link href="/terms" className="font-semibold text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/contact" className="font-semibold text-primary hover:underline">
                contact form
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SitePageLayout>
  );
}
