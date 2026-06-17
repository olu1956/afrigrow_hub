import type { Metadata } from "next";
import Link from "next/link";
import { SitePageLayout } from "@/components/landing/SitePageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — AfriGrow Hub",
  description: "AfriGrow Hub privacy policy — how we handle your data.",
};

const sections = [
  {
    title: "1. Overview",
    content:
      "AfriGrow Hub (\"we\", \"us\", \"our\") respects your privacy. This policy explains what information we collect, how we use it, and your rights. This is a Phase 1 preview policy and will be updated before full production launch.",
  },
  {
    title: "2. Information we collect",
    content:
      "When you use AfriGrow Hub, we may collect account details (name, email, business name), profile information you provide, usage data about how you interact with AI agents, and technical data such as browser type and device information.",
  },
  {
    title: "3. How we use your information",
    content:
      "We use your information to provide and improve the platform, personalise AI agent recommendations, facilitate business matching, process subscription billing (when live), and communicate important service updates.",
  },
  {
    title: "4. Data storage & security",
    content:
      "Your data is stored securely using industry-standard encryption and access controls. In this preview phase, some session data is stored locally in your browser. Production deployments will use secure server-side storage.",
  },
  {
    title: "5. Sharing your information",
    content:
      "We do not sell your personal data. We may share information with trusted service providers (hosting, payments, analytics) who help us operate the platform, and when required by law.",
  },
  {
    title: "6. Your rights",
    content:
      "You have the right to access, correct, or delete your personal data. You may also object to certain processing or request data portability, subject to applicable law. Contact us to exercise these rights.",
  },
  {
    title: "7. Cookies",
    content:
      "We use essential cookies and local storage to keep you signed in and remember your preferences. Analytics cookies may be introduced in a later phase with clear consent options.",
  },
  {
    title: "8. Changes to this policy",
    content:
      "We may update this privacy policy from time to time. We will notify you of significant changes via email or an in-app notice before they take effect.",
  },
];

export default function PrivacyPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Last updated: 17 June 2026 · Phase 1 preview
          </p>
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
            <h2 className="text-lg font-semibold text-foreground">9. Contact us</h2>
            <p className="mt-3 leading-relaxed text-muted">
              If you have questions about this privacy policy or how we handle your
              data, please{" "}
              <Link href="/contact" className="font-semibold text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SitePageLayout>
  );
}
