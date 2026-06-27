import type { Metadata } from "next";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { ContactPageContent } from "@/app/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact — AfriGrow Hub",
  description: "Get in touch with the AfriGrow Hub team.",
};

export default function ContactPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Contact</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Questions about AfriGrow Hub, partnerships, or enterprise plans? Send us a message
            and we&apos;ll get back to you.
          </p>
        </div>
      </section>
      <ContactPageContent />
    </SitePageLayout>
  );
}
