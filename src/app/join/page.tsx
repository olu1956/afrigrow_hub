import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Handshake,
  Megaphone,
  Wallet,
} from "lucide-react";
import { JoinNowButton } from "@/components/landing/JoinNowButton";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import {
  FREE_LAUNCH_BADGE,
  FREE_LAUNCH_CTA_LINE,
  FREE_LAUNCH_JOIN_LINE,
} from "@/lib/product-messaging";

export const metadata: Metadata = {
  title: "Join Free — Founding Members",
  description:
    "Become a founding member of AfriGrow Hub. Free early access to AI tools for profiles, marketing, matching, funding, and CRM — no credit card required.",
};

const benefits = [
  {
    icon: Building2,
    title: "Professional business profile",
    description: "Get listed in the directory and look credible to buyers and partners.",
  },
  {
    icon: Megaphone,
    title: "AI marketing & promotion",
    description: "Create social posts, WhatsApp promos, and campaigns in your brand voice.",
  },
  {
    icon: Handshake,
    title: "Buyer & supplier matching",
    description: "Connect with businesses across Africa that fit your category and needs.",
  },
  {
    icon: Wallet,
    title: "Funding readiness",
    description: "Discover grants and build a checklist to become funding-ready.",
  },
];

const included = [
  "Founding membership — free during early access, no credit card",
  "Business profile & directory listing when you reach 40% strength",
  "Access to AI agents for growth tasks",
  "Matching marketplace enquiries",
  "CRM contacts & follow-up tools",
  "Business Academy guides",
  "Recognised as an early founding member when paid plans launch",
];

export default function JoinPage() {
  return (
    <SitePageLayout>
      <section className="border-b border-border bg-primary-light/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {FREE_LAUNCH_BADGE}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Join as a founding member
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {FREE_LAUNCH_JOIN_LINE}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <JoinNowButton size="lg" href="/signup" />
            <Link
              href="/login"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Already a member? Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Everything you need to compete and grow
            </h2>
            <p className="mt-3 text-muted">
              One platform — built for how African small businesses actually work.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">What&apos;s included</h2>
            <p className="mt-3 text-muted">
              Start free today. {FREE_LAUNCH_CTA_LINE}
            </p>
            <ul className="mt-8 space-y-4">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-dark to-primary p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Ready to join?
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              Create your free business account in minutes
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Set up your profile, activate AI agents, and start connecting with
              buyers, suppliers, and partners across Africa.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
            >
              Join now — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SitePageLayout>
  );
}
