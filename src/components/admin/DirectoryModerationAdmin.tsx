"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2, Search } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import {
  getAdminDirectoryBusinessesAction,
  removeDirectoryBusinessAction,
  setDirectoryHiddenAction,
  type AdminDirectoryBusiness,
} from "@/lib/auth/admin-directory-actions";

type Filter = "all" | "listed" | "unlisted" | "incomplete";

function locationLabel(business: AdminDirectoryBusiness): string {
  return [business.city, business.country].filter(Boolean).join(", ") || "—";
}

export function DirectoryModerationAdmin() {
  const [businesses, setBusinesses] = useState<AdminDirectoryBusiness[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const result = await getAdminDirectoryBusinessesAction();
    if (result.warning) setWarning(result.warning);
    else setWarning(null);

    if (!result.ok) {
      setError(result.error ?? "Could not load businesses.");
      setBusinesses([]);
    } else {
      setBusinesses(result.businesses ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businesses.filter((business) => {
      if (filter === "listed" && !business.listed) return false;
      if (filter === "unlisted" && !business.directoryHidden) return false;
      if (
        filter === "incomplete" &&
        (business.listed || business.directoryHidden || business.profileScore >= 40)
      ) {
        return false;
      }

      if (!q) return true;
      return (
        business.businessName.toLowerCase().includes(q) ||
        business.email.toLowerCase().includes(q) ||
        business.industry.toLowerCase().includes(q) ||
        locationLabel(business).toLowerCase().includes(q)
      );
    });
  }, [businesses, filter, query]);

  const stats = useMemo(
    () => ({
      total: businesses.length,
      listed: businesses.filter((b) => b.listed).length,
      unlisted: businesses.filter((b) => b.directoryHidden).length,
    }),
    [businesses],
  );

  async function handleUnlist(business: AdminDirectoryBusiness) {
    setBusyId(business.id);
    setError(null);
    setNotice(null);
    const result = await setDirectoryHiddenAction({
      businessId: business.id,
      hidden: true,
    });
    setBusyId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not unlist business.");
      return;
    }
    setNotice(`Unlisted “${business.businessName}” from the Directory.`);
    await load();
  }

  async function handleRelist(business: AdminDirectoryBusiness) {
    setBusyId(business.id);
    setError(null);
    setNotice(null);
    const result = await setDirectoryHiddenAction({
      businessId: business.id,
      hidden: false,
    });
    setBusyId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not relist business.");
      return;
    }
    setNotice(`Relisted “${business.businessName}” in the Directory.`);
    await load();
  }

  async function handleRemove(business: AdminDirectoryBusiness) {
    const confirmed = window.confirm(
      `Remove “${business.businessName}” permanently?\n\nThis deletes their AfriGrow account and all related data. Use this for duplicates or accounts you do not want on the platform.`,
    );
    if (!confirmed) return;

    setBusyId(business.id);
    setError(null);
    setNotice(null);
    const result = await removeDirectoryBusinessAction({ businessId: business.id });
    setBusyId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not remove business.");
      return;
    }
    setNotice(`Removed “${business.businessName}” and their account.`);
    await load();
  }

  return (
    <DashboardPageLayout
      title="Directory moderation"
      description="Unlist businesses from the public Directory, or remove duplicate / unwanted accounts."
      heroExtra={
        notice || warning || error ? (
          <>
            {notice ? (
              <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
                {notice}
              </div>
            ) : null}
            {warning ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {warning}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </>
        ) : undefined
      }
      heroFooter={
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={`${dashboardCardClass} px-4 py-3`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">All businesses</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className={`${dashboardCardClass} px-4 py-3`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Listed</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.listed}</p>
          </div>
          <div className={`${dashboardCardClass} px-4 py-3`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Admin-unlisted</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.unlisted}</p>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["listed", "Listed"],
              ["unlisted", "Unlisted"],
              ["incomplete", "Incomplete"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                filter === value
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, industry…"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${dashboardCardClass} py-16 text-center`}>
          <Building2 className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-medium text-foreground">No businesses match</p>
          <p className="mt-2 text-sm text-muted">Try another filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((business) => {
            const busy = busyId === business.id;
            return (
              <div key={business.id} className={`${dashboardCardClass} p-5`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {business.listed ? (
                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          Listed
                        </span>
                      ) : business.directoryHidden ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                          Unlisted
                        </span>
                      ) : (
                        <span className="rounded-full bg-background px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted ring-1 ring-border">
                          Incomplete
                        </span>
                      )}
                      {business.isVerified ? (
                        <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                          Verified
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-foreground">
                      {business.businessName}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {[business.industry || "No industry", locationLabel(business)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Score {business.profileScore}%
                      {business.email ? ` · ${business.email}` : ""}
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                    {business.directoryHidden ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRelist(business)}
                        className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background disabled:opacity-60"
                      >
                        {busy ? "Working…" : "Relist"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleUnlist(business)}
                        className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background disabled:opacity-60"
                      >
                        {busy ? "Working…" : "Unlist"}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRemove(business)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      {busy ? "Working…" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardPageLayout>
  );
}
