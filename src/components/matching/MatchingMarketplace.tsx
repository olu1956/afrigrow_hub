"use client";

import { useMemo, useState } from "react";
import { Handshake, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EnquiryModal } from "@/components/matching/EnquiryModal";
import { MatchCard } from "@/components/matching/MatchCard";
import {
  categoryFilters,
  countryFilters,
  marketplaceListings,
  matchTypeTabs,
  type ListingCategory,
  type MarketplaceListing,
  type MatchType,
} from "@/lib/matching-data";

export function MatchingMarketplace() {
  const [matchType, setMatchType] = useState<MatchType>("suppliers");
  const [category, setCategory] = useState<ListingCategory | "all">("all");
  const [country, setCountry] = useState("All countries");
  const [search, setSearch] = useState("");
  const [enquiryTarget, setEnquiryTarget] = useState<MarketplaceListing | null>(null);

  const filtered = useMemo(() => {
    return marketplaceListings
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
  }, [matchType, category, country, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Matching Marketplace"
        description="Find buyers, suppliers, and partners matched to your business profile and needs."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Active matches", value: String(filtered.length) },
          { icon: Handshake, label: "Partnerships this month", value: "4" },
          { icon: Search, label: "Enquiries sent", value: "7" },
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

      {filtered.length === 0 ? (
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

      <EnquiryModal listing={enquiryTarget} onClose={() => setEnquiryTarget(null)} />
    </div>
  );
}
