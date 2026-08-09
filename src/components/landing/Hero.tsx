"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bot,
  Building2,
  Handshake,
  LineChart,
  Sparkles,
} from "lucide-react";
import { JoinNowButton } from "@/components/landing/JoinNowButton";
import { getDashboardStatsAction } from "@/lib/auth/dashboard-stats-actions";
import { FREE_LAUNCH_BADGE, FREE_LAUNCH_HERO_LINE } from "@/lib/product-messaging";
import { useAuthenticatedUser } from "@/lib/use-authenticated-user";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";
import { calculateProfileStrength, loadProfilePreview } from "@/lib/profile-data";

const demoStats = [
  { icon: Building2, label: "Profile strength", value: "92%" },
  { icon: LineChart, label: "Marketing reach", value: "+340" },
  { icon: Handshake, label: "New matches", value: "12" },
];

export function Hero() {
  const { isAuthenticated, session, hydrated } = useAuthenticatedUser();
  const { business, loading } = useDashboardBusiness();
  const [profileStrength, setProfileStrength] = useState<number | null>(null);
  const [marketingCampaigns, setMarketingCampaigns] = useState<number | null>(null);
  const [matchEnquiries, setMatchEnquiries] = useState<number | null>(null);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      setProfileStrength(
        calculateProfileStrength(loadProfilePreview(session)),
      );

      void getDashboardStatsAction().then((result) => {
        if (result.ok && result.stats) {
          setMarketingCampaigns(result.stats.marketingCampaigns);
          setMatchEnquiries(result.stats.matchEnquiries);
        }
      });
    }
  }, [hydrated, isAuthenticated, session]);

  const showDemo = !isAuthenticated;
  const previewLoading = isAuthenticated && loading;

  const dashboardLabel = showDemo
    ? "Example growth dashboard"
    : "Your growth dashboard";

  const welcomeName = showDemo
    ? "Amara's Textiles"
    : previewLoading
      ? "…"
      : business.name || business.owner || "your business";

  const planLabel = showDemo
    ? "Growth plan"
    : previewLoading
      ? "…"
      : `${business.plan} plan`;

  const stats = showDemo
    ? demoStats
    : [
        {
          icon: Building2,
          label: "Profile strength",
          value:
            profileStrength !== null ? `${profileStrength}%` : "—",
        },
        {
          icon: LineChart,
          label: "Marketing campaigns",
          value:
            marketingCampaigns !== null ? String(marketingCampaigns) : "—",
        },
        {
          icon: Handshake,
          label: "Match enquiries",
          value: matchEnquiries !== null ? String(matchEnquiries) : "—",
        },
      ];

  const previewCard = (
    <div className="rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/5">
      <div className="rounded-xl bg-gradient-to-br from-primary-dark to-primary p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/70">{dashboardLabel}</p>
            <p className="truncate text-xl font-bold text-white sm:text-2xl">
              Welcome back, {welcomeName}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {planLabel}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
            >
              <stat.icon className="mb-2 h-5 w-5 text-accent" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
          <Bot className="h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm text-white/90">
            <span className="font-semibold text-white">Marketing Agent:</span>{" "}
            {showDemo
              ? "3 social posts ready for your weekend sale. Review & publish →"
              : marketingCampaigns && marketingCampaigns > 0
                ? `${marketingCampaigns} saved campaign${marketingCampaigns === 1 ? "" : "s"} — open Marketing Agent →`
                : "Open your dashboard to create marketing content →"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {FREE_LAUNCH_BADGE}
          </div>

          <h1 className="animate-fade-up-delay-1 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {isAuthenticated ? (
              <>
                Pick up where you left off with{" "}
                <span className="text-primary">{business.name || "your business"}</span>
              </>
            ) : (
              <>
                Grow your business with{" "}
                <span className="text-primary">intelligent agents</span> built for
                African businesses
              </>
            )}
          </h1>

          <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {isAuthenticated
              ? "Your agents, matches, and growth tools are ready in the dashboard."
              : FREE_LAUNCH_HERO_LINE}
          </p>

          <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-accent/30 transition hover:bg-accent/90"
              >
                Go to dashboard
              </Link>
            ) : (
              <JoinNowButton size="lg" href="/signup" className="!rounded-full shadow-lg shadow-accent/30" />
            )}
            <a
              href={isAuthenticated ? "/dashboard/marketing" : "/#agents"}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-base font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary-light/50"
            >
              {isAuthenticated ? "Open marketing agent" : "Explore AI agents"}
            </a>
          </div>
        </div>

        <div className="animate-fade-up-delay-3 mx-auto mt-16 max-w-4xl">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="block transition hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/10"
            >
              {previewCard}
            </Link>
          ) : (
            previewCard
          )}
        </div>
      </div>
    </section>
  );
}
