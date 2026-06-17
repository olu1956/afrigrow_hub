"use client";

import { useMemo, useState } from "react";
import { PiggyBank, Search, Target, Wallet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ApplicationModal } from "@/components/funding/ApplicationModal";
import { GrantCard } from "@/components/funding/GrantCard";
import { ReadinessChecklist } from "@/components/funding/ReadinessChecklist";
import {
  calculateReadiness,
  defaultCompletedItems,
  fundingTypeFilters,
  grantOpportunities,
  type FundingType,
  type GrantOpportunity,
} from "@/lib/funding-data";

export function FundingAgent() {
  const [typeFilter, setTypeFilter] = useState<FundingType | "all">("all");
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState<Set<string>>(defaultCompletedItems);
  const [selectedGrant, setSelectedGrant] = useState<GrantOpportunity | null>(null);

  const readiness = useMemo(() => calculateReadiness(completed), [completed]);

  const filtered = useMemo(() => {
    return grantOpportunities
      .filter((g) => typeFilter === "all" || g.type === typeFilter)
      .filter((g) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.provider.toLowerCase().includes(q) ||
          g.region.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [typeFilter, search]);

  function toggleItem(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Finance & Funding Agent"
        description="Discover grants, loans, and investment opportunities — and get funding-ready with guided checklists."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Wallet, label: "Matched opportunities", value: String(filtered.length) },
          { icon: Target, label: "Funding readiness", value: `${readiness}%` },
          { icon: PiggyBank, label: "Potential funding", value: "₦15M+" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <stat.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <ReadinessChecklist
              completed={completed}
              onToggle={toggleItem}
              readiness={readiness}
            />
          </div>
        </div>

        <div className="space-y-5 lg:col-span-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search grants, loans, programmes…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FundingType | "all")}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {fundingTypeFilters.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="font-medium text-foreground">No opportunities found</p>
              <p className="mt-1 text-sm text-muted">Try a different filter or search term.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((grant) => (
                <GrantCard
                  key={grant.id}
                  grant={grant}
                  onApply={setSelectedGrant}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ApplicationModal
        grant={selectedGrant}
        completedItems={completed}
        onClose={() => setSelectedGrant(null)}
      />
    </div>
  );
}
