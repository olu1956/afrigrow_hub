"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { GuideCard } from "@/components/learning/GuideCard";
import { getPublishedGuidesAction } from "@/lib/auth/guide-actions";
import { isGuideFeaturedNow, type GuideView } from "@/lib/learning/guide-mapper";
import { guideTopicFilters } from "@/lib/learning/guides-data";
import type { GuideTopic } from "@/lib/database/business-guides";

export function BusinessAcademyContent() {
  const [guides, setGuides] = useState<GuideView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [topic, setTopic] = useState<GuideTopic | "all">("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getPublishedGuidesAction();
      if (result.warning) setWarning(result.warning);
      if (!result.ok) {
        setError(result.error ?? "Could not load guides.");
        setGuides(result.guides ?? []);
      } else {
        setGuides(result.guides ?? []);
      }
      setLoading(false);
    }

    void load();
  }, []);

  const filtered = useMemo(() => {
    const base = topic === "all" ? guides : guides.filter((guide) => guide.topic === topic);
    if (topic === "all") {
      return base.filter((guide) => !isGuideFeaturedNow(guide));
    }
    return base;
  }, [guides, topic]);

  const featured = useMemo(
    () => guides.filter((guide) => isGuideFeaturedNow(guide)),
    [guides],
  );

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {warning ? (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {warning}
          </p>
        ) : null}
        {error ? (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Featured business guides
            </h2>
            <p className="mt-2 text-muted">
              Quick reads on topics that match your AfriGrow agents — refreshed periodically.
            </p>
          </div>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as GuideTopic | "all")}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {guideTopicFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {topic === "all" && featured.length > 0 ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            ) : null}

            <div className="mt-12 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-foreground">
                {topic === "all" ? "All guides" : `${guideTopicFilters.find((f) => f.value === topic)?.label} guides`}
              </h3>
              <p className="text-sm text-muted">
                {filtered.length} guide{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center">
                <p className="font-semibold text-foreground">No guides in this topic yet</p>
                <p className="mt-2 text-sm text-muted">Try another filter or check back soon.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
