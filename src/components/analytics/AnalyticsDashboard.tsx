"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Bot, TrendingUp } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  getDashboardStatsAction,
  type DashboardStats,
} from "@/lib/auth/dashboard-stats-actions";
import { useSession } from "@/components/providers/SessionProvider";
import { calculateProfileStrength, loadProfilePreview } from "@/lib/profile-data";

const emptyStats: DashboardStats = {
  profileStrength: null,
  crmContacts: 0,
  crmFollowUpsDue: 0,
  marketingCampaigns: 0,
  matchEnquiries: 0,
  fundingReadiness: null,
  invoicesCreated: 0,
  quotationsCreated: 0,
};

export function AnalyticsDashboard() {
  const { session, hydrated, authEnabled } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profileStrength, setProfileStrength] = useState<number | null>(null);

  useEffect(() => {
    if (hydrated) {
      setProfileStrength(calculateProfileStrength(loadProfilePreview(session)));
    }
  }, [hydrated, session]);

  useEffect(() => {
    if (!hydrated || !authEnabled) return;

    async function load() {
      const result = await getDashboardStatsAction();
      if (result.ok && result.stats) {
        setStats(result.stats);
      }
    }

    void load();
  }, [authEnabled, hydrated]);

  const snapshot = stats ?? emptyStats;

  const overview = useMemo(
    () => [
      {
        label: "Profile strength",
        value: profileStrength !== null ? `${profileStrength}%` : "—",
        change: profileStrength !== null ? "From your profile" : "Complete your profile",
        positive: profileStrength !== null && profileStrength >= 50,
      },
      {
        label: "Marketing campaigns",
        value: String(snapshot.marketingCampaigns),
        change:
          snapshot.marketingCampaigns > 0 ? "Saved drafts & posts" : "None saved yet",
        positive: snapshot.marketingCampaigns > 0,
      },
      {
        label: "CRM contacts",
        value: String(snapshot.crmContacts),
        change:
          snapshot.crmFollowUpsDue > 0
            ? `${snapshot.crmFollowUpsDue} follow-ups due`
            : snapshot.crmContacts > 0
              ? "Active pipeline"
              : "Add your first lead",
        positive: snapshot.crmContacts > 0,
      },
      {
        label: "Match enquiries",
        value: String(snapshot.matchEnquiries),
        change: snapshot.matchEnquiries > 0 ? "Sent from Matching" : "None sent yet",
        positive: snapshot.matchEnquiries > 0,
      },
    ],
    [profileStrength, snapshot],
  );

  const accountRows = useMemo(
    () => [
      { label: "Marketing campaigns saved", value: snapshot.marketingCampaigns },
      { label: "CRM contacts", value: snapshot.crmContacts },
      { label: "Follow-ups due", value: snapshot.crmFollowUpsDue },
      { label: "Match enquiries sent", value: snapshot.matchEnquiries },
      { label: "Client invoices", value: snapshot.invoicesCreated },
      { label: "Quotations", value: snapshot.quotationsCreated },
      {
        label: "Funding readiness",
        value:
          snapshot.fundingReadiness !== null ? `${snapshot.fundingReadiness}%` : "Not set up",
      },
    ],
    [snapshot],
  );

  return (
    <DashboardPageLayout
      title="Analytics"
      description="Live counts from your account. Trend charts will be added as more activity builds up."
      heroFooter={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overview.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              positive={stat.positive}
            />
          ))}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <section className={`${dashboardCardClass} lg:col-span-3`}>
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Account summary</h2>
          </div>
          <ul className="divide-y divide-border">
            {accountRows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
              >
                <span className="text-foreground">{row.label}</span>
                <span className="font-semibold text-primary">
                  {typeof row.value === "number" ? row.value.toLocaleString() : row.value}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${dashboardCardClass} lg:col-span-2`}>
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">What to do next</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted">
            {snapshot.marketingCampaigns === 0 && (
              <li>• Save a marketing post in the Marketing Agent</li>
            )}
            {snapshot.crmContacts === 0 && (
              <li>• Add your first lead in CRM</li>
            )}
            {snapshot.matchEnquiries === 0 && (
              <li>• Send a marketplace enquiry in Matching</li>
            )}
            {snapshot.fundingReadiness === null && (
              <li>• Complete your funding checklist in Finance Agent</li>
            )}
            {(profileStrength ?? 0) < 40 && (
              <li>• Reach 40% profile strength to appear in the public directory</li>
            )}
            {snapshot.marketingCampaigns > 0 &&
              snapshot.crmContacts > 0 &&
              snapshot.matchEnquiries > 0 &&
              snapshot.fundingReadiness !== null &&
              (profileStrength ?? 0) >= 40 && (
                <li className="text-foreground">
                  You&apos;re building momentum — keep using your agents weekly.
                </li>
              )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-primary-light/30 p-5">
        <div className="flex items-start gap-3">
          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Trend charts coming later</p>
            <p className="mt-1 text-sm text-muted">
              Profile views over time and marketing reach charts need more history. The
              numbers above are live from your CRM, marketing, matching, billing, and funding
              data today.
            </p>
          </div>
        </div>
      </section>
    </DashboardPageLayout>
  );
}
