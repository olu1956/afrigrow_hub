"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import {
  getAdminGuidesAction,
  seedBusinessGuidesAction,
  updateBusinessGuideAction,
} from "@/lib/auth/guide-actions";
import { GUIDE_TOPICS, type GuideStatus, type GuideTopic } from "@/lib/database/business-guides";
import { guideTopicLabels } from "@/lib/learning/guides-data";
import { isGuideFeaturedNow, type GuideView } from "@/lib/learning/guide-mapper";

export function BusinessGuidesAdmin() {
  const [guides, setGuides] = useState<GuideView[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const result = await getAdminGuidesAction();
    if (result.warning) setWarning(result.warning);
    if (!result.ok) {
      setError(result.error ?? "Could not load guides.");
      setGuides([]);
    } else {
      setGuides(result.guides ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSeed() {
    setSeeding(true);
    setNotice(null);
    setError(null);
    const result = await seedBusinessGuidesAction();
    setSeeding(false);
    if (!result.ok) {
      setError(result.error ?? "Could not load seed guides.");
      return;
    }
    setNotice("Seed guides loaded into the database.");
    await load();
  }

  async function saveGuide(
    id: string,
    updates: {
      status?: GuideStatus;
      isFeatured?: boolean;
      topic?: GuideTopic;
    },
  ) {
    setSavingId(id);
    setError(null);
    setNotice(null);
    const result = await updateBusinessGuideAction({ id, ...updates });
    setSavingId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not update guide.");
      return;
    }
    setNotice("Guide updated.");
    await load();
  }

  return (
    <DashboardPageLayout
      title="Business guides"
      description="Publish and feature SME learning guides for Build a Business Academy."
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
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSeed()}
          disabled={seeding}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {seeding ? "Loading seed guides…" : "Load seed guides"}
        </button>
        <p className="self-center text-sm text-muted">
          Imports the 8 built-in guides into Supabase so you can publish and feature them without
          redeploying.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : guides.length === 0 ? (
        <div className={`${dashboardCardClass} py-16 text-center`}>
          <BookOpen className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-medium text-foreground">No guides in the database yet</p>
          <p className="mt-2 text-sm text-muted">
            Run setup_business_guides.sql in Supabase, then click Load seed guides.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {guides.map((guide) => (
            <div key={guide.id} className={`${dashboardCardClass} p-5`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                      {guide.topicLabel}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        guide.status === "published"
                          ? "bg-primary text-white"
                          : "bg-background text-muted ring-1 ring-border"
                      }`}
                    >
                      {guide.status}
                    </span>
                    {isGuideFeaturedNow(guide) ? (
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-foreground">{guide.title}</h2>
                  <p className="mt-1 text-sm text-muted">{guide.summary}</p>
                  <p className="mt-2 text-xs text-muted">
                    /learn/{guide.slug} · {guide.readTimeMinutes} min · {guide.publishedLabel}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[220px]">
                  <label className="space-y-1">
                    <span className="text-xs font-medium text-muted">Status</span>
                    <select
                      value={guide.status}
                      disabled={savingId === guide.id}
                      onChange={(e) =>
                        void saveGuide(guide.id, {
                          status: e.target.value as GuideStatus,
                        })
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-medium text-muted">Topic</span>
                    <select
                      value={guide.topic}
                      disabled={savingId === guide.id}
                      onChange={(e) =>
                        void saveGuide(guide.id, {
                          topic: e.target.value as GuideTopic,
                        })
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {GUIDE_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {guideTopicLabels[topic]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={guide.isFeatured}
                      disabled={savingId === guide.id}
                      onChange={(e) =>
                        void saveGuide(guide.id, { isFeatured: e.target.checked })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Featured on academy page
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPageLayout>
  );
}
