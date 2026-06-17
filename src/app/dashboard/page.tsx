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
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useSession } from "@/components/providers/SessionProvider";
import { agentModules, mockBusiness } from "@/lib/dashboard-nav";
import { calculateProfileStrength, loadProfilePreview } from "@/lib/profile-data";

const recentActivity = [
  {
    agent: "Marketing Agent",
    href: "/dashboard/marketing",
    message: "3 social posts ready for your weekend sale",
    time: "2 hours ago",
    icon: Megaphone,
  },
  {
    agent: "Matching",
    href: "/dashboard/matching",
    message: "New supplier match: Accra Fabrics Co.",
    time: "5 hours ago",
    icon: Handshake,
  },
  {
    agent: "CRM",
    href: "/dashboard/crm",
    message: "Follow-up due for 4 customers",
    time: "Today",
    icon: MessageSquare,
  },
  {
    agent: "Profile Agent",
    href: "/dashboard/profile",
    message: "Complete your profile to unlock better recommendations",
    time: "Yesterday",
    icon: Building2,
  },
];

export default function DashboardOverviewPage() {
  const { session, hydrated } = useSession();
  const business = hydrated ? session : mockBusiness;
  const [profileStrength, setProfileStrength] = useState<number | null>(null);

  useEffect(() => {
    if (hydrated) {
      setProfileStrength(
        calculateProfileStrength(loadProfilePreview(session)),
      );
    }
  }, [hydrated, session]);

  const recentItems = useMemo(
    () =>
      recentActivity.map((item) =>
        item.agent === "Profile Agent" && profileStrength !== null
          ? {
              ...item,
              message: `Profile strength is at ${profileStrength}% — keep building`,
            }
          : item,
      ),
    [profileStrength],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={`Welcome back, ${business.owner.split(" ")[0]}`}
        description={`Here's what's happening with ${business.name} today.`}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {business.plan} plan
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Profile strength"
          value={profileStrength !== null ? `${profileStrength}%` : "—"}
          change={
            profileStrength !== null && profileStrength >= 70
              ? "Looking good — keep going"
              : "Complete your profile"
          }
          positive={profileStrength !== null && profileStrength >= 50}
        />
        <StatCard label="Marketing reach" value="340" change="+24 new views" positive />
        <StatCard label="Active matches" value="12" change="3 pending replies" positive />
        <StatCard label="CRM contacts" value="48" change="4 follow-ups due" />
      </div>

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
                <li key={item.message}>
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
          <h2 className="mt-3 text-lg font-bold">Quick tip</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Complete your business profile to unlock better AI marketing and
            matching recommendations.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
          >
            Open Profile Agent
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-primary-light/30 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Funding readiness: 68%</p>
              <p className="text-sm text-muted">
                2 checklist items remaining — Finance Agent can help you prepare.
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
    </div>
  );
}
