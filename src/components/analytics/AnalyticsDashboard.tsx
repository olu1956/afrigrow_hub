"use client";

import { useMemo, useState } from "react";
import { BarChart3, Bot, TrendingUp } from "lucide-react";
import { BarChart } from "@/components/analytics/BarChart";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  getAnalyticsSnapshot,
  timeRangeOptions,
  type TimeRange,
} from "@/lib/analytics-data";

export function AnalyticsDashboard() {
  const [range, setRange] = useState<TimeRange>("30d");
  const snapshot = useMemo(() => getAnalyticsSnapshot(range), [range]);

  const maxSessions = Math.max(...snapshot.agentUsage.map((a) => a.sessions), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Analytics"
        description="Track profile views, marketing reach, agent usage, and business growth over time."
        action={
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  range === option.value
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {snapshot.overview.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            positive={stat.positive}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart title="Profile views" points={snapshot.profileViews} />
        <BarChart
          title="Marketing reach"
          points={snapshot.marketingReach}
          color="bg-accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
          <div className="mb-5 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Agent usage</h2>
          </div>
          <ul className="space-y-4">
            {snapshot.agentUsage.map((agent) => {
              const width = Math.round((agent.sessions / maxSessions) * 100);
              return (
                <li key={agent.agent}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{agent.agent} Agent</span>
                    <span className="text-muted">
                      {agent.sessions} sessions · {agent.actions} actions
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-primary-light">
                    <div
                      className={`h-full rounded-full ${agent.color}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Milestones</h2>
          </div>
          <ul className="space-y-4">
            {snapshot.milestones.map((milestone) => (
              <li
                key={milestone.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <p className="text-sm font-semibold text-foreground">{milestone.title}</p>
                <p className="mt-1 text-sm text-muted">{milestone.description}</p>
                <p className="mt-2 text-xs text-muted">{milestone.date}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-primary-light/30 p-5">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Live data integrations coming soon</p>
            <p className="mt-1 text-sm text-muted">
              Analytics will connect to your CRM, marketing, and matching activity in a later
              phase. These figures are preview data for the selected time range.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
