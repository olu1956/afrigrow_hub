"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Building2, Mail, User } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { submitPartnerApplicationAction } from "@/lib/auth/enterprise-enquiry-actions";

export function BecomeAPartnerForm() {
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [offer, setOffer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitPartnerApplicationAction({
      companyName: company,
      contactName,
      email,
      website,
      offer,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Could not submit your application.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          {[
            {
              icon: Building2,
              title: "Who we partner with",
              text: "Banks, fintechs, SaaS tools, logistics providers, insurers, and training organisations serving African SMEs.",
            },
            {
              icon: User,
              title: "What you get",
              text: "Visibility in our partner directory, co-marketing opportunities, and access to a growing SME audience.",
            },
            {
              icon: Mail,
              title: "Next steps",
              text: "Submit your details and our partnerships team will review and respond within 5 business days.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            );
          })}

          <p className="text-sm leading-relaxed text-muted">
            Review tiers, example offers, and agreement terms on the{" "}
            <Link
              href="/partners/programme"
              className="font-semibold text-primary hover:underline"
            >
              Partner Programme
            </Link>{" "}
            page before you apply.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:col-span-3">
          <div className="bg-accent px-5 py-3">
            <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-white">
              Find out more
            </h2>
          </div>

          <div className="p-6">
          {submitted ? (
            <div className="rounded-2xl border border-primary/20 bg-primary-light p-6 text-center">
              <p className="font-semibold text-primary">Application received</p>
              <p className="mt-2 text-sm text-muted">
                Thanks, {contactName || "there"}! We&apos;ll review your partnership
                application and be in touch at {email || "your email"}.
              </p>
              <Link
                href="/partners"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                View our partners →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <p className="text-sm text-muted">
                Tell us about your organisation and what you would offer AfriGrow members.
              </p>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <AuthInput
                label="Company name"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your organisation"
                required
              />
              <AuthInput
                label="Contact name"
                name="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name"
                required
              />
              <AuthInput
                label="Email address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partnerships@company.com"
                required
              />
              <AuthInput
                label="Website"
                name="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
              />
              <div className="space-y-2">
                <label htmlFor="offer" className="text-sm font-medium text-foreground">
                  What would you offer AfriGrow members?
                </label>
                <textarea
                  id="offer"
                  name="offer"
                  rows={4}
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="Describe your product, service, or special offer for SMEs…"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <AuthButton loading={loading}>Submit application</AuthButton>
            </form>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
