"use client";

import { useEffect, useMemo, useState } from "react";
import { Handshake, Loader2, Search, Users } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { DashboardStatGrid } from "@/components/dashboard/DashboardPageCanvas";
import { EnquiryModal } from "@/components/matching/EnquiryModal";
import { MatchCard } from "@/components/matching/MatchCard";
import { useSession } from "@/components/providers/SessionProvider";
import {
  getMarketplaceDataAction,
  saveMarketplaceEnquiryAction,
} from "@/lib/auth/matching-actions";
import {
  categoryFilters,
  countryFilters,
  matchTypeTabs,
  type ListingCategory,
  type MarketplaceListing,
  type MatchType,
} from "@/lib/matching-data";

export function MatchingMarketplace() {
  const { hydrated, authEnabled } = useSession();
  const [matchType, setMatchType] = useState<MatchType>("suppliers");
  const [category, setCategory] = useState<ListingCategory | "all">("all");
  const [country, setCountry] = useState("All countries");
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(authEnabled);
  const [error, setError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeMatches: 0,
    partnershipsThisMonth: 0,
    enquiriesSent: 0,
  });
  const [enquiryTarget, setEnquiryTarget] = useState<MarketplaceListing | null>(null);

  async function loadMarketplace(nextMatchType: MatchType = matchType) {
    if (!authEnabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getMarketplaceDataAction(nextMatchType);
    if (result.warning) {
      setSetupWarning(result.warning);
    }

    if (!result.ok) {
      setError(result.error ?? "Could not load marketplace matches.");
      setLoading(false);
      return;
    }

    setListings(result.listings ?? []);
    setStats(
      result.stats ?? {
        activeMatches: 0,
        partnershipsThisMonth: 0,
        enquiriesSent: 0,
      },
    );
    setLoading(false);
  }

  useEffect(() => {
    if (!hydrated) return;
    void loadMarketplace(matchType);
  }, [authEnabled, hydrated, matchType]);

  const filtered = useMemo(() => {
    return listings
      .filter((l) => l.matchType.includes(matchType))
      .filter((l) => category === "all" || l.category === category)
      .filter((l) => country === "All countries" || l.country === country)
      .filter((l) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.tagline.toLowerCase().includes(q) ||
          l.lookingFor.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [listings, matchType, category, country, search]);

  const liveListingCount = useMemo(
    () => listings.filter((listing) => listing.source === "live").length,
    [listings],
  );
  const showingSampleListings = authEnabled && liveListingCount === 0 && listings.length > 0;

  async function handleEnquirySent(listing: MarketplaceListing) {
    const result = await saveMarketplaceEnquiryAction({
      matchedBusinessId: listing.id,
      matchType,
      matchScore: listing.matchScore,
    });

    if (result.warning && !result.match) {
      setSetupWarning(result.warning);
      return;
    }

    if (!result.ok) {
      setError(result.error ?? "Could not save your enquiry.");
      return;
    }

    await loadMarketplace(matchType);
    setError(null);
  }

  return (
    <DashboardPageLayout
      title="Matching Marketplace"
      description="Find buyers, suppliers, and partners matched to your business profile and needs."
      heroExtra={
        setupWarning || error || loading ? (
          <>
            {loading ? (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
                Loading marketplace matches…
              </div>
            ) : null}
            {setupWarning ? (
              <div className="rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-sm text-foreground">
                <strong className="font-semibold">Database setup needed.</strong> {setupWarning}
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
        <DashboardStatGrid
          stats={[
            { icon: Users, label: "Active matches", value: String(filtered.length) },
            {
              icon: Handshake,
              label: "Partnerships this month",
              value: String(stats.partnershipsThisMonth),
            },
            { icon: Search, label: "Enquiries sent", value: String(stats.enquiriesSent) },
          ]}
        />
      }
    >
      {showingSampleListings && (
        <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-foreground">Sample businesses shown.</span> Enquiries on
          samples are preview-only — connect with live directory profiles as more members join.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {matchTypeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMatchType(tab.id)}
            className={`rounded-xl border px-4 py-2.5 text-left transition ${
              matchType === tab.id
                ? "border-primary bg-primary text-white"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <p className="text-sm font-semibold">{tab.label}</p>
            <p
              className={`text-xs ${
                matchType === tab.id ? "text-white/70" : "text-muted"
              }`}
            >
              {tab.description}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search businesses, services, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ListingCategory | "all")}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {categoryFilters.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {countryFilters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <p className="font-medium text-foreground">No matches found</p>
          <p className="mt-1 text-sm text-muted">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <MatchCard
              key={listing.id}
              listing={listing}
              onEnquire={setEnquiryTarget}
            />
          ))}
        </div>
      )}

      <EnquiryModal
        listing={enquiryTarget}
        onClose={() => setEnquiryTarget(null)}
        onSent={handleEnquirySent}
      />
    </DashboardPageLayout>
  );
}
