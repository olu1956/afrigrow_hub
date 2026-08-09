"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  Handshake,
  Megaphone,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProfileDirectoryNudge } from "@/components/profile/ProfileDirectoryNudge";
import {
  getDashboardStatsAction,
  type DashboardStats,
} from "@/lib/auth/dashboard-stats-actions";
import { getMyDirectoryStatusAction } from "@/lib/auth/directory-actions";
import { getDirectoryNudge } from "@/lib/directory/profile-directory-nudge";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import { useSession } from "@/components/providers/SessionProvider";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";
import { agentModules } from "@/lib/dashboard-nav";
import { calculateProfileStrength, loadProfilePreview } from "@/lib/profile-data";

type ActivityItem = {
  agent: string;
  href: string;
  message: string;
  time: string;
  icon: typeof Megaphone;
};

function buildRecentActivity(
  stats: DashboardStats,
  profileStrength: number | null,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  if (stats.marketingCampaigns > 0) {
    items.push({
      agent: "Marketing Agent",
      href: "/dashboard/marketing",
      message: `${stats.marketingCampaigns} saved campaign${stats.marketingCampaigns === 1 ? "" : "s"}`,
      time: "Your account",
      icon: Megaphone,
    });
  }

  if (stats.matchEnquiries > 0) {
    items.push({
      agent: "Matching",
      href: "/dashboard/matching",
      message: `${stats.matchEnquiries} marketplace enquir${stats.matchEnquiries === 1 ? "y" : "ies"} sent`,
      time: "Your account",
      icon: Handshake,
    });
  }

  if (stats.crmFollowUpsDue > 0) {
    items.push({
      agent: "CRM",
      href: "/dashboard/crm",
      message: `Follow-up due for ${stats.crmFollowUpsDue} contact${stats.crmFollowUpsDue === 1 ? "" : "s"}`,
      time: "Today",
      icon: MessageSquare,
    });
  } else if (stats.crmContacts > 0) {
    items.push({
      agent: "CRM",
      href: "/dashboard/crm",
      message: `${stats.crmContacts} contact${stats.crmContacts === 1 ? "" : "s"} in your pipeline`,
      time: "Your account",
      icon: MessageSquare,
    });
  }

  items.push({
    agent: "Profile Agent",
    href: "/dashboard/profile",
    message:
      profileStrength !== null
        ? `Profile strength is at ${profileStrength}% — keep building`
        : "Complete your profile to unlock better recommendations",
    time: "Your account",
    icon: Building2,
  });

  if (stats.invoicesCreated > 0 || stats.quotationsCreated > 0) {
    items.unshift({
      agent: "Billing",
      href: "/dashboard/billing",
      message: `${stats.invoicesCreated} invoice${stats.invoicesCreated === 1 ? "" : "s"}, ${stats.quotationsCreated} quotation${stats.quotationsCreated === 1 ? "" : "s"} created`,
      time: "Your account",
      icon: Wallet,
    });
  }

  return items.slice(0, 4);
}

export default function DashboardOverviewPage() {
  const { session, hydrated, authEnabled } = useSession();
  const { business } = useDashboardBusiness();
  const [profileStrength, setProfileStrength] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listedInDirectory, setListedInDirectory] = useState(false);
  const [savedProfileStrength, setSavedProfileStrength] = useState<number | null>(null);

  useEffect(() => {
    if (hydrated) {
      setProfileStrength(
        calculateProfileStrength(loadProfilePreview(session)),
      );
    }
  }, [hydrated, session]);

  useEffect(() => {
    if (!hydrated || !authEnabled) return;

    async function loadStats() {
      const [statsResult, directoryStatus] = await Promise.all([
        getDashboardStatsAction(),
        getMyDirectoryStatusAction(),
      ]);

      if (statsResult.ok && statsResult.stats) {
        setStats(statsResult.stats);
        if (statsResult.stats.profileStrength !== null) {
          setSavedProfileStrength(statsResult.stats.profileStrength);
        }
      }

      if (directoryStatus.ok) {
        setListedInDirectory(directoryStatus.listed);
        if (directoryStatus.profileScore !== null) {
          setSavedProfileStrength(directoryStatus.profileScore);
        }
      }
    }

    void loadStats();
  }, [authEnabled, hydrated]);

  const recentItems = useMemo(
    () =>
      buildRecentActivity(
        stats ?? {
          profileStrength: null,
          crmContacts: 0,
          crmFollowUpsDue: 0,
          marketingCampaigns: 0,
          matchEnquiries: 0,
          fundingReadiness: null,
          invoicesCreated: 0,
          quotationsCreated: 0,
        },
        profileStrength,
      ),
    [profileStrength, stats],
  );

  const fundingReadiness = stats?.fundingReadiness;
  const fundingRemaining =
    fundingReadiness !== null && fundingReadiness !== undefined
      ? Math.max(0, 100 - fundingReadiness)
      : null;

  const effectiveStrength = savedProfileStrength ?? profileStrength;
  const directoryNudge =
    effectiveStrength !== null
      ? getDirectoryNudge({
          strength: effectiveStrength,
          savedStrength: savedProfileStrength,
          listed: listedInDirectory,
        })
      : null;

  return (
    <DashboardPageLayout
      title={`Welcome back${business.owner.trim() ? `, ${business.owner.split(" ")[0]}` : ""}`}
      description={
        business.name.trim()
          ? `Here's what's happening with ${business.name} today.`
          : "Here's what's happening with your business today."
      }
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {business.plan} plan
        </span>
      }
      heroExtra={
        authEnabled && directoryNudge && !listedInDirectory ? (
          <ProfileDirectoryNudge content={directoryNudge} compact />
        ) : undefined
      }
      heroFooter={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Profile strength"
            value={effectiveStrength !== null ? `${effectiveStrength}%` : "—"}
            change={
              listedInDirectory
                ? "Live in the directory"
                : effectiveStrength !== null && effectiveStrength >= DIRECTORY_MIN_PROFILE_SCORE
                  ? "Save profile to go live"
                  : effectiveStrength !== null && effectiveStrength >= 70
                    ? "Looking good — keep going"
                    : `Reach ${DIRECTORY_MIN_PROFILE_SCORE}% for directory`
            }
            positive={
              listedInDirectory ||
              (effectiveStrength !== null && effectiveStrength >= DIRECTORY_MIN_PROFILE_SCORE)
            }
          />
          <StatCard
            label="Marketing campaigns"
            value={stats ? String(stats.marketingCampaigns) : "—"}
            change={
              stats && stats.marketingCampaigns > 0
                ? "Saved in Marketing Agent"
                : "Create your first post"
            }
            positive={Boolean(stats && stats.marketingCampaigns > 0)}
          />
          <StatCard
            label="Match enquiries"
            value={stats ? String(stats.matchEnquiries) : "—"}
            change={
              stats && stats.matchEnquiries > 0
                ? "Sent from Matching"
                : "Browse the marketplace"
            }
            positive={Boolean(stats && stats.matchEnquiries > 0)}
          />
          <StatCard
            label="CRM contacts"
            value={stats ? String(stats.crmContacts) : "—"}
            change={
              stats && stats.crmFollowUpsDue > 0
                ? `${stats.crmFollowUpsDue} follow-up${stats.crmFollowUpsDue === 1 ? "" : "s"} due`
                : stats && stats.crmContacts > 0
                  ? "Pipeline active"
                  : "Add your first lead"
            }
            positive={Boolean(stats && stats.crmContacts > 0 && stats.crmFollowUpsDue === 0)}
          />
        </div>
      }
    >
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">AI Agents</h2>
          <p className="text-xs text-muted">Click to open each workspace</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agentModules.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link
                key={agent.href}
                href={agent.href}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{agent.name}</h3>
                <p className="mt-1 text-sm text-muted">{agent.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Open agent
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Recent activity</h2>
          </div>
          <ul className="space-y-4">
            {recentItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={`${item.agent}-${item.message}`}>
                  <Link
                    href={item.href}
                    className="flex gap-3 rounded-xl border border-transparent p-2 transition hover:border-primary/20 hover:bg-primary-light/30"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary">{item.agent}</p>
                      <p className="text-sm text-foreground">{item.message}</p>
                      <p className="mt-0.5 text-xs text-muted">{item.time}</p>
                    </div>
                    <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-muted/50" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-dark to-primary p-5 text-white lg:col-span-2">
          <TrendingUp className="h-6 w-6 text-accent" />
          <h2 className="mt-3 text-lg font-bold">
            {listedInDirectory ? "You're in the directory" : "Quick tip"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            {listedInDirectory
              ? "Your business profile is discoverable in the AfriGrow Directory. Keep it updated to attract more enquiries."
              : effectiveStrength !== null && effectiveStrength >= DIRECTORY_MIN_PROFILE_SCORE
                ? "Your profile score qualifies for the directory — save in Profile Agent to go live."
                : effectiveStrength !== null
                  ? `You're ${Math.max(0, DIRECTORY_MIN_PROFILE_SCORE - effectiveStrength)}% away from appearing in the Business Directory.`
                  : "Complete your business profile to unlock better AI marketing and matching recommendations."}
          </p>
          <Link
            href={listedInDirectory ? "/dashboard/directory" : "/dashboard/profile"}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
          >
            {listedInDirectory ? "View directory" : "Open Profile Agent"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-primary-light/30 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">
                {fundingReadiness !== null && fundingReadiness !== undefined
                  ? `Funding readiness: ${fundingReadiness}%`
                  : "Funding readiness: not set up yet"}
              </p>
              <p className="text-sm text-muted">
                {fundingReadiness !== null && fundingReadiness !== undefined
                  ? fundingRemaining && fundingRemaining > 0
                    ? `${fundingRemaining}% to go on your checklist — Finance Agent can help.`
                    : "Checklist looks strong — explore matched programmes."
                  : "Save your funding profile to track readiness."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/funding"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View funding tools →
          </Link>
        </div>
      </section>
    </DashboardPageLayout>
  );
}
