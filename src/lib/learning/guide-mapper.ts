import type { BusinessGuideRow } from "@/lib/database/business-guides";
import { guideTopicLabels } from "@/lib/learning/guides-data";
import type { GuideSeed } from "@/lib/learning/guides-data";

export type GuideView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  topic: BusinessGuideRow["topic"];
  topicLabel: string;
  author: string;
  readTimeMinutes: number;
  isFeatured: boolean;
  featuredUntil: string | null;
  status: BusinessGuideRow["status"];
  linkedAgentHref: string;
  linkedAgentLabel: string;
  publishedAt: string | null;
  publishedLabel: string;
  source: "live" | "static";
};

function formatPublishedLabel(iso: string | null | undefined): string {
  if (!iso) return "Recently published";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function isGuideFeaturedNow(guide: {
  isFeatured: boolean;
  featuredUntil: string | null;
}): boolean {
  if (!guide.isFeatured) return false;
  if (!guide.featuredUntil) return true;
  return new Date(guide.featuredUntil) > new Date();
}

export function slugifyGuideTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Match stored slug or a title-derived slug (e.g. build-your-funding-readiness-checklist). */
export function findGuideBySlug(guides: GuideView[], slug: string): GuideView | undefined {
  const normalized = slug.trim().toLowerCase();
  const exact = guides.find((guide) => guide.slug === normalized);
  if (exact) return exact;

  return guides.find((guide) => slugifyGuideTitle(guide.title) === normalized);
}

export function mapGuideRow(row: BusinessGuideRow): GuideView {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    topic: row.topic,
    topicLabel: guideTopicLabels[row.topic],
    author: row.author,
    readTimeMinutes: row.read_time_minutes,
    isFeatured: row.is_featured,
    featuredUntil: row.featured_until,
    status: row.status,
    linkedAgentHref: row.linked_agent_href,
    linkedAgentLabel: row.linked_agent_label,
    publishedAt: row.published_at,
    publishedLabel: formatPublishedLabel(row.published_at),
    source: "live",
  };
}

export function mapGuideSeed(seed: GuideSeed, index: number): GuideView {
  return {
    id: `static-${seed.slug}`,
    slug: seed.slug,
    title: seed.title,
    summary: seed.summary,
    body: seed.body,
    topic: seed.topic,
    topicLabel: guideTopicLabels[seed.topic],
    author: seed.author ?? "AfriGrow Hub",
    readTimeMinutes: seed.readTimeMinutes ?? 5,
    isFeatured: seed.isFeatured,
    featuredUntil: seed.featuredUntil ?? null,
    status: seed.status,
    linkedAgentHref: seed.linkedAgentHref ?? "",
    linkedAgentLabel: seed.linkedAgentLabel ?? "",
    publishedAt: seed.publishedAt ?? null,
    publishedLabel: formatPublishedLabel(seed.publishedAt),
    source: "static",
  };
}

export function mergePublishedGuides(
  staticGuides: GuideSeed[],
  rows: BusinessGuideRow[],
): GuideView[] {
  const bySlug = new Map<string, GuideView>();

  for (const seed of staticGuides) {
    if (seed.status === "published") {
      bySlug.set(seed.slug, mapGuideSeed(seed, 0));
    }
  }

  for (const row of rows) {
    if (row.status === "published") {
      bySlug.set(row.slug, mapGuideRow(row));
    }
  }

  return [...bySlug.values()].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function rowFromGuideInput(
  input: GuideSeed | BusinessGuideRow,
): Record<string, unknown> {
  if ("read_time_minutes" in input) {
    return input;
  }

  return {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    topic: input.topic,
    author: input.author ?? "AfriGrow Hub",
    read_time_minutes: input.readTimeMinutes ?? 5,
    is_featured: input.isFeatured ?? false,
    featured_until: input.featuredUntil ?? null,
    status: input.status ?? "published",
    linked_agent_href: input.linkedAgentHref ?? "",
    linked_agent_label: input.linkedAgentLabel ?? "",
    published_at: input.publishedAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
