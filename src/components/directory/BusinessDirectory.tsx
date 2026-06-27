"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Building2, Loader2, Search, Star } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { DashboardStatGrid } from "@/components/dashboard/DashboardPageCanvas";
import { DirectoryListingCard } from "@/components/directory/DirectoryListingCard";
import { DirectoryProfileModal } from "@/components/directory/DirectoryProfileModal";
import { ProfileDirectoryNudge } from "@/components/profile/ProfileDirectoryNudge";
import {
  getDirectoryListingsAction,
  getMyDirectoryStatusAction,
} from "@/lib/auth/directory-actions";
import { getDirectoryNudge } from "@/lib/directory/profile-directory-nudge";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import { useSession } from "@/components/providers/SessionProvider";
import {
  buildCountryFilters,
  categoryFilters,
  directoryListings as sampleDirectoryListings,
  filterDirectoryListings,
  mergeDirectoryListings,
  sortOptions,
  type DirectoryListing,
  type ListingCategory,
  type SortOption,
} from "@/lib/directory-data";

export function BusinessDirectory() {
  const { authEnabled } = useSession();
  const [liveListings, setLiveListings] = useState<DirectoryListing[]>([]);
  const [loading, setLoading] = useState(authEnabled);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [category, setCategory] = useState<ListingCategory | "all">("all");
  const [country, setCountry] = useState("All countries");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [selected, setSelected] = useState<DirectoryListing | null>(null);
  const [myProfileScore, setMyProfileScore] = useState<number | null>(null);
  const [listedInDirectory, setListedInDirectory] = useState(false);

  useEffect(() => {
    if (!authEnabled) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const [result, myStatus] = await Promise.all([
        getDirectoryListingsAction(),
        getMyDirectoryStatusAction(),
      ]);
      if (!active) return;

      if (!result.ok) {
        setLoadError(result.error ?? "Unable to load directory listings.");
        setLiveListings([]);
      } else {
        setLiveListings(result.listings);
      }

      if (myStatus.ok) {
        setMyProfileScore(myStatus.profileScore);
        setListedInDirectory(myStatus.listed);
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [authEnabled]);

  const allListings = useMemo(
    () =>
      mergeDirectoryListings(
        liveListings,
        sampleDirectoryListings,
        !authEnabled || liveListings.length === 0,
      ),
    [authEnabled, liveListings],
  );

  const countryFilters = useMemo(() => buildCountryFilters(allListings), [allListings]);

  const filtered = useMemo(
    () =>
      filterDirectoryListings(allListings, {
        category,
        country,
        search,
        sort,
      }),
    [allListings, category, country, search, sort],
  );

  const liveCount = liveListings.length;
  const sampleCount = allListings.filter((l) => l.source === "sample").length;
  const featuredCount = allListings.filter((l) => l.featured).length;
  const verifiedCount = allListings.filter((l) => l.verified).length;
  const directoryNudge =
    myProfileScore !== null
      ? getDirectoryNudge({
          strength: myProfileScore,
          savedStrength: myProfileScore,
          listed: listedInDirectory,
        })
      : null;

  return (
    <DashboardPageLayout
      title="Business Directory"
      description={
        authEnabled
          ? "Browse AfriGrow member profiles. Sample listings are marked until more businesses join."
          : "Discover African SMEs across retail, manufacturing, services, and more."
      }
      heroExtra={
        loadError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {loadError}
          </p>
        ) : authEnabled && directoryNudge ? (
          <ProfileDirectoryNudge content={directoryNudge} compact />
        ) : undefined
      }
      heroFooter={
        <DashboardStatGrid
          stats={[
            {
              icon: Building2,
              label: authEnabled ? "Live listings" : "Listed businesses",
              value: loading ? "…" : String(liveCount || allListings.length),
            },
            {
              icon: Star,
              label: "Featured listings",
              value: loading ? "…" : String(featuredCount),
            },
            {
              icon: BookOpen,
              label: "Verified profiles",
              value: loading ? "…" : String(verifiedCount),
            },
          ]}
        />
      }
    >
      {authEnabled && liveCount > 0 && listedInDirectory && (
        <p className="rounded-xl border border-primary/20 bg-primary-light/40 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold text-primary">Your business is listed here.</span>{" "}
          {liveCount} live profile{liveCount !== 1 ? "s" : ""} from AfriGrow members — including yours at{" "}
          {myProfileScore ?? DIRECTORY_MIN_PROFILE_SCORE}% strength.
        </p>
      )}

      {authEnabled && liveCount > 0 && !listedInDirectory && (
        <p className="rounded-xl border border-primary/20 bg-primary-light/40 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold text-primary">{liveCount} live profile{liveCount !== 1 ? "s" : ""}</span>{" "}
          from AfriGrow members. Reach {DIRECTORY_MIN_PROFILE_SCORE}% profile strength to join them.
        </p>
      )}

      {authEnabled && !loading && liveCount === 0 && sampleCount > 0 && !listedInDirectory && (
        <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-foreground">Sample listings shown.</span> Complete your
          profile to 40% to appear here — be among the first live businesses in your category.
        </p>
      )}

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

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="font-semibold text-foreground">No businesses found</p>
          <p className="mt-2 text-sm text-muted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">
            Showing {filtered.length} business{filtered.length !== 1 ? "es" : ""}
            {liveCount > 0 ? ` (${liveCount} live)` : ""}
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
    </DashboardPageLayout>
  );
}
