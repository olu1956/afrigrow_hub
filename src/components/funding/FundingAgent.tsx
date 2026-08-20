"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PiggyBank, Search, Target, Wallet } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { DashboardStatGrid } from "@/components/dashboard/DashboardPageCanvas";
import { ApplicationModal } from "@/components/funding/ApplicationModal";
import { FundingProfileForm } from "@/components/funding/FundingProfileForm";
import { GrantCard } from "@/components/funding/GrantCard";
import { ReadinessChecklist } from "@/components/funding/ReadinessChecklist";
import { useSession } from "@/components/providers/SessionProvider";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";
import {
  getFundingProfileAction,
  saveFundingProfileAction,
} from "@/lib/auth/funding-actions";
import { getPublishedFundingCatalogueAction } from "@/lib/auth/funding-catalogue-actions";
import type { BusinessStage } from "@/lib/database/funding-profiles";
import {
  defaultFundingPotentialLabel,
  fundingCurrencyHint,
  resolveBusinessCurrency,
} from "@/lib/funding/currency";
import { formatFundingPotential } from "@/lib/funding/profile-mapper";
import {
  calculateReadiness,
  defaultCompletedItems,
  FUNDING_DISCLAIMER,
  fundingOpportunities as seedFundingOpportunities,
  fundingTypeFilters,
  type FundingOpportunityDefinition,
  type FundingType,
  type MatchedGrantOpportunity,
} from "@/lib/funding-data";
import { matchFundingOpportunities } from "@/lib/funding/match-opportunities";

export function FundingAgent() {
  const { hydrated, authEnabled } = useSession();
  const { business } = useDashboardBusiness();
  const businessCountry = business.country.trim();
  const currency = useMemo(
    () => resolveBusinessCurrency(businessCountry),
    [businessCountry],
  );
  const initialized = useRef(false);
  const [catalogue, setCatalogue] = useState<FundingOpportunityDefinition[]>(
    seedFundingOpportunities,
  );
  const [typeFilter, setTypeFilter] = useState<FundingType | "all">("all");
  const [search, setSearch] = useState("");
  const [businessStage, setBusinessStage] = useState<BusinessStage>("early");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [fundingNeeded, setFundingNeeded] = useState("");
  const [fundingPurpose, setFundingPurpose] = useState("");
  const [completed, setCompleted] = useState<Set<string>>(defaultCompletedItems);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<MatchedGrantOpportunity | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(authEnabled);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [catalogueNotice, setCatalogueNotice] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const readiness = useMemo(() => calculateReadiness(completed), [completed]);

  const fundingPotentialLabel = useMemo(() => {
    const amount = Number.parseFloat(fundingNeeded);
    if (Number.isFinite(amount) && amount > 0) {
      return formatFundingPotential(amount, businessCountry);
    }
    return defaultFundingPotentialLabel(businessCountry);
  }, [fundingNeeded, businessCountry]);

  const currencyHint = useMemo(
    () => fundingCurrencyHint(businessCountry),
    [businessCountry],
  );

  const persistProfile = useCallback(
    async (nextCompleted: Set<string>) => {
      if (!authEnabled || setupWarning) return { ok: true as const };

      const result = await saveFundingProfileAction({
        businessStage,
        annualRevenue: Number.parseFloat(annualRevenue) || 0,
        fundingNeeded: Number.parseFloat(fundingNeeded) || 0,
        fundingPurpose,
        completedChecklist: [...nextCompleted],
        country: businessCountry,
      });

      if (result.warning) {
        setSetupWarning(result.warning);
      }

      if (!result.ok) {
        return { ok: false as const, error: result.error };
      }

      if (result.profile) {
        setRecommendations(result.profile.recommendations.items);
      }

      return { ok: true as const };
    },
    [
      annualRevenue,
      authEnabled,
      businessStage,
      fundingNeeded,
      fundingPurpose,
      setupWarning,
      businessCountry,
    ],
  );

  useEffect(() => {
    if (!hydrated || initialized.current) return;

    async function init() {
      setLoadingProfile(true);
      setError(null);

      const catalogueResult = await getPublishedFundingCatalogueAction();
      if (catalogueResult.opportunities?.length) {
        setCatalogue(catalogueResult.opportunities);
      }
      if (catalogueResult.warning) {
        setCatalogueNotice(catalogueResult.warning);
      }
      if (catalogueResult.error) {
        setCatalogueNotice(catalogueResult.error);
      }

      if (!authEnabled) {
        setLoadingProfile(false);
        initialized.current = true;
        return;
      }

      const result = await getFundingProfileAction();
      if (result.warning) {
        setSetupWarning(result.warning);
      }

      if (!result.ok) {
        setError(result.error ?? "Could not load your funding profile.");
        setLoadingProfile(false);
        initialized.current = true;
        return;
      }

      if (result.profile) {
        setBusinessStage(result.profile.business_stage);
        setAnnualRevenue(
          result.profile.annual_revenue > 0 ? String(result.profile.annual_revenue) : "",
        );
        setFundingNeeded(
          result.profile.funding_needed > 0 ? String(result.profile.funding_needed) : "",
        );
        setFundingPurpose(result.profile.funding_purpose);
        setCompleted(new Set(result.profile.recommendations.completedChecklist));
        setRecommendations(result.profile.recommendations.items);
      }

      setLoadingProfile(false);
      initialized.current = true;
    }

    void init();
  }, [authEnabled, hydrated]);

  const matchedOpportunities = useMemo(() => {
    const fundingAmount = Number.parseFloat(fundingNeeded) || 0;

    return matchFundingOpportunities(catalogue, {
      country: businessCountry,
      businessStage,
      fundingNeeded: fundingAmount,
      businessType: business.businessType,
      readinessScore: readiness,
    });
  }, [
    business.businessType,
    businessCountry,
    businessStage,
    catalogue,
    fundingNeeded,
    readiness,
  ]);

  const filtered = useMemo(() => {
    return matchedOpportunities
      .filter((g) => typeFilter === "all" || g.type === typeFilter)
      .filter((g) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.provider.toLowerCase().includes(q) ||
          g.region.toLowerCase().includes(q)
        );
      });
  }, [matchedOpportunities, typeFilter, search]);

  async function toggleItem(id: string) {
    const nextCompleted = new Set(completed);
    if (nextCompleted.has(id)) nextCompleted.delete(id);
    else nextCompleted.add(id);
    setCompleted(nextCompleted);

    if (!authEnabled || setupWarning) return;

    const result = await persistProfile(nextCompleted);
    if (!result.ok) {
      setError(result.error ?? "Could not update your funding profile.");
      setCompleted(completed);
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    setError(null);
    setSavedNotice(false);

    const result = await persistProfile(completed);

    setSavingProfile(false);

    if (!result.ok) {
      setError(result.error ?? "Could not save your funding profile.");
      return;
    }

    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  }

  return (
    <DashboardPageLayout
      title="Finance & Funding Agent"
      description="Discover grants and loans matched to your country and profile — then prepare your checklist before applying on the provider's site."
      heroExtra={
        loadingProfile || error || setupWarning || catalogueNotice || savedNotice ? (
          <>
            {loadingProfile ? (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
                Loading your funding profile…
              </div>
            ) : null}
            {setupWarning ? (
              <div className="rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-sm text-foreground">
                <strong className="font-semibold">Database setup needed.</strong> {setupWarning}
              </div>
            ) : null}
            {catalogueNotice ? (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
                {catalogueNotice}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {savedNotice ? (
              <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
                Funding profile saved.
              </div>
            ) : null}
          </>
        ) : undefined
      }
      heroFooter={
        <DashboardStatGrid
          stats={[
            { icon: Wallet, label: "Matched opportunities", value: String(filtered.length) },
            { icon: Target, label: "Funding readiness", value: `${readiness}%` },
            { icon: PiggyBank, label: "Funding target", value: fundingPotentialLabel },
          ]}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <FundingProfileForm
            businessStage={businessStage}
            annualRevenue={annualRevenue}
            fundingNeeded={fundingNeeded}
            fundingPurpose={fundingPurpose}
            recommendations={recommendations}
            currencySymbol={currency.symbol}
            currencyHint={currencyHint}
            countryLabel={businessCountry || undefined}
            disabled={!authEnabled || Boolean(setupWarning) || loadingProfile}
            saving={savingProfile}
            onBusinessStageChange={setBusinessStage}
            onAnnualRevenueChange={setAnnualRevenue}
            onFundingNeededChange={setFundingNeeded}
            onFundingPurposeChange={setFundingPurpose}
            onSubmit={handleSaveProfile}
          />
          <ReadinessChecklist
            completed={completed}
            onToggle={toggleItem}
            readiness={readiness}
          />
        </div>

        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-xl border border-primary/15 bg-primary-light/30 px-4 py-3 text-sm text-foreground">
            {FUNDING_DISCLAIMER}
          </div>

          {businessCountry ? (
            <p className="text-sm text-muted">
              Showing programmes relevant to{" "}
              <span className="font-medium text-foreground">{businessCountry}</span>
              {matchedOpportunities.length > 0
                ? ` — ${filtered.length} matched`
                : " — save your funding profile to improve match scores"}
              .
            </p>
          ) : (
            <p className="text-sm text-muted">
              Set your country in Profile or Settings to see region-specific programmes.
            </p>
          )}

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
              <p className="font-medium text-foreground">No programmes for your region yet</p>
              <p className="mt-1 text-sm text-muted">
                {businessCountry
                  ? "Try a different filter or update your funding profile — more regions are added regularly."
                  : "Set your country in Profile or Settings, then save your funding profile."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((grant) => (
                <GrantCard key={grant.id} grant={grant} onPrepare={setSelectedGrant} />
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
    </DashboardPageLayout>
  );
}
