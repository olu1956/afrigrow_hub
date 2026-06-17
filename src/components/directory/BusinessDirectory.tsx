"use client";

import { useMemo, useState } from "react";
import { BookOpen, Building2, Search, Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DirectoryListingCard } from "@/components/directory/DirectoryListingCard";
import { DirectoryProfileModal } from "@/components/directory/DirectoryProfileModal";
import {
  categoryFilters,
  countryFilters,
  directoryListings,
  filterDirectoryListings,
  sortOptions,
  type DirectoryListing,
  type ListingCategory,
  type SortOption,
} from "@/lib/directory-data";

export function BusinessDirectory() {
  const [category, setCategory] = useState<ListingCategory | "all">("all");
  const [country, setCountry] = useState("All countries");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [selected, setSelected] = useState<DirectoryListing | null>(null);

  const filtered = useMemo(
    () =>
      filterDirectoryListings(directoryListings, {
        category,
        country,
        search,
        sort,
      }),
    [category, country, search, sort],
  );

  const featuredCount = directoryListings.filter((l) => l.featured).length;
  const verifiedCount = directoryListings.filter((l) => l.verified).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Business Directory"
        description="Discover verified African SMEs across retail, manufacturing, services, and more."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Building2, label: "Listed businesses", value: String(directoryListings.length) },
          { icon: Star, label: "Featured listings", value: String(featuredCount) },
          { icon: BookOpen, label: "Verified profiles", value: String(verifiedCount) },
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search businesses, services, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ListingCategory | "all")}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {categoryFilters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {countryFilters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="font-semibold text-foreground">No businesses found</p>
          <p className="mt-2 text-sm text-muted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">
            Showing {filtered.length} business{filtered.length !== 1 ? "es" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <DirectoryListingCard
                key={listing.id}
                listing={listing}
                onView={setSelected}
              />
            ))}
          </div>
        </>
      )}

      <DirectoryProfileModal listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
