"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { DirectoryListingCard } from "@/components/directory/DirectoryListingCard";
import { DirectoryProfileModal } from "@/components/directory/DirectoryProfileModal";
import { MatchCard } from "@/components/matching/MatchCard";
import { DemoJoinCta } from "@/components/demo/DemoJoinCta";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { directoryListings, type DirectoryListing } from "@/lib/directory-data";
import { marketplaceListings } from "@/lib/matching-data";
import { demoContacts, statusLabels, statusStyles } from "@/lib/crm-data";
import {
  fundingOpportunities,
  readinessItems,
  typeLabels,
  typeStyles,
} from "@/lib/funding-data";
import type { DemoStepSlug } from "@/lib/demo/tour";

const profileChecks = [
  { label: "Business name", done: true },
  { label: "Industry & location", done: true },
  { label: "Logo & tagline", done: true },
  { label: "Services list", done: true },
  { label: "Website & WhatsApp", done: true },
  { label: "Social links", done: false },
];

const demoCampaigns = [
  {
    type: "WhatsApp",
    title: "Weekend Ankara sale",
    body: "Lagos Loom Studio — this weekend only. 20% off wholesale Ankara from 50 yards. Delivery across Lagos. Reply YES for the catalogue.",
  },
  {
    type: "Instagram",
    title: "Bridal fabric drop",
    body: "New lace & bridal fabrics just landed. Tag a designer who needs this. Visit the studio or order via WhatsApp.",
  },
];

const completedReadiness = new Set(["r1", "r2", "r4"]);

type DemoStepPanelsProps = {
  slug: DemoStepSlug;
};

export function DemoStepPanels({ slug }: DemoStepPanelsProps) {
  const [listing, setListing] = useState<DirectoryListing | null>(null);
  const [joinReason, setJoinReason] = useState<string | null>(null);

  function askToJoin(reason: string) {
    setJoinReason(reason);
  }

  return (
    <div className="space-y-6">
      {slug === "profile" ? <ProfilePanel /> : null}

      {slug === "directory" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {directoryListings.slice(0, 4).map((item) => (
            <DirectoryListingCard key={item.id} listing={item} onView={setListing} />
          ))}
          <DirectoryProfileModal listing={listing} onClose={() => setListing(null)} />
        </div>
      ) : null}

      {slug === "marketing" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {demoCampaigns.map((campaign) => (
            <article key={campaign.title} className={`${dashboardCardClass} p-5`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {campaign.type}
              </p>
              <h2 className="mt-2 font-semibold text-foreground">{campaign.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                {campaign.body}
              </p>
              <button
                type="button"
                onClick={() =>
                  askToJoin("Sign up to generate posts in your brand voice and save campaigns.")
                }
                className="mt-5 w-full rounded-xl border border-primary/20 bg-primary-light py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
              >
                Review & publish
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {slug === "matching" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketplaceListings.slice(0, 3).map((item) => (
            <MatchCard
              key={item.id}
              listing={item}
              onEnquire={() =>
                askToJoin("Join free to send enquiries to buyers, suppliers, and partners.")
              }
            />
          ))}
        </div>
      ) : null}

      {slug === "funding" ? <FundingPanel /> : null}

      {slug === "crm" ? (
        <div className="space-y-3">
          {demoContacts.slice(0, 3).map((contact) => (
            <article key={contact.id} className={`${dashboardCardClass} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-foreground">{contact.name}</h2>
                  <p className="text-sm text-muted">{contact.business}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusStyles[contact.status]}`}
                >
                  {statusLabels[contact.status]}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground">{contact.notes}</p>
              <p className="mt-2 text-xs text-muted">
                Next follow-up: {contact.nextFollowUp} · {contact.nextFollowUpType}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <DemoJoinCta reason={joinReason ?? undefined} />
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className={`${dashboardCardClass} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Lagos Loom Studio</h2>
            <VerificationBadge verified />
          </div>
          <p className="mt-1 text-sm text-muted">
            Premium African fabrics & bespoke tailoring · Lagos, Nigeria
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">92%</p>
          <p className="text-xs text-muted">Profile strength</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground">
        Family-run textile business specialising in Ankara, lace, and custom bridal wear.
        Serving Lagos and nationwide delivery since 2018.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {profileChecks.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-foreground">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted" />
            )}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FundingPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={`${dashboardCardClass} p-5`}>
        <h2 className="font-semibold text-foreground">Readiness checklist · 68%</h2>
        <ul className="mt-4 space-y-3">
          {readinessItems.slice(0, 5).map((item) => {
            const done = completedReadiness.has(item.id);
            return (
              <li key={item.id} className="flex gap-3">
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="space-y-3">
        {fundingOpportunities.slice(0, 2).map((opportunity) => (
          <article key={opportunity.id} className={`${dashboardCardClass} p-5`}>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${typeStyles[opportunity.type]}`}
            >
              {typeLabels[opportunity.type]}
            </span>
            <h2 className="mt-3 font-semibold text-foreground">{opportunity.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {opportunity.provider} · {opportunity.amount}
            </p>
            <p className="mt-2 text-sm text-foreground">{opportunity.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
