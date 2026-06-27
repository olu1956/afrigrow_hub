"use server";

import { revalidatePath } from "next/cache";
import { isPlatformAdminUser } from "@/lib/auth/admin-access";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import {
  BUSINESS_GUIDES_TABLE,
  type BusinessGuideRow,
  type GuideStatus,
  type GuideTopic,
} from "@/lib/database/business-guides";
import {
  findGuideBySlug,
  mergePublishedGuides,
  mapGuideRow,
  type GuideView,
} from "@/lib/learning/guide-mapper";
import { getStaticGuideBySlug, seedBusinessGuides } from "@/lib/learning/guides-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type GuideActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type GuidesListResult = GuideActionResult & {
  guides?: GuideView[];
};

export type GuideDetailResult = GuideActionResult & {
  guide?: GuideView;
};

function isMissingTableError(message: string): boolean {
  return (
    /relation ["']?public\.business_guides["']? does not exist/i.test(message) ||
    /Could not find the table ['"]public\.business_guides['"] in the schema cache/i.test(
      message,
    )
  );
}

function publishedStaticGuides(): GuideView[] {
  return mergePublishedGuides(seedBusinessGuides, []);
}

async function assertPlatformAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "You must be logged in." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  if (!isAdmin) {
    return { ok: false as const, error: "You do not have access to this admin area." };
  }

  return { ok: true as const, supabase };
}

export async function getPublishedGuidesAction(): Promise<GuidesListResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, guides: publishedStaticGuides() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(BUSINESS_GUIDES_TABLE)
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: true,
        guides: publishedStaticGuides(),
        warning:
          "Using built-in guides. Run supabase/scripts/setup_business_guides.sql to enable database publishing.",
      };
    }
    return { ok: false, error: error.message, guides: publishedStaticGuides() };
  }

  return {
    ok: true,
    guides: mergePublishedGuides(seedBusinessGuides, (data ?? []) as BusinessGuideRow[]),
  };
}

export async function getGuideBySlugAction(slug: string): Promise<GuideDetailResult> {
  const allResult = await getPublishedGuidesAction();
  const guides = allResult.guides ?? publishedStaticGuides();
  const guide = findGuideBySlug(guides, slug);

  if (guide) {
    return { ok: true, guide };
  }

  const staticGuide = getStaticGuideBySlug(slug);
  if (staticGuide?.status === "published") {
    return {
      ok: true,
      guide: mergePublishedGuides([staticGuide], []).find((g) => g.slug === slug),
    };
  }

  return { ok: false, error: "Guide not found." };
}

export async function getAdminGuidesAction(): Promise<GuidesListResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const adminClient = createAdminClient();
  const queryClient = adminClient ?? auth.supabase;

  const { data, error } = await queryClient
    .from(BUSINESS_GUIDES_TABLE)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: true,
        guides: [],
        warning:
          "The business_guides table is not set up yet. Run supabase/scripts/setup_business_guides.sql in Supabase SQL Editor.",
      };
    }
    return { ok: false, error: error.message };
  }

  const guides = ((data ?? []) as BusinessGuideRow[]).map(mapGuideRow);
  return { ok: true, guides };
}

export async function seedBusinessGuidesAction(): Promise<GuideActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const adminClient = createAdminClient();
  const queryClient = adminClient ?? auth.supabase;

  for (const seed of seedBusinessGuides) {
    const payload = {
      slug: seed.slug,
      title: seed.title,
      summary: seed.summary,
      body: seed.body,
      topic: seed.topic,
      author: seed.author ?? "AfriGrow Hub",
      read_time_minutes: seed.readTimeMinutes ?? 5,
      is_featured: seed.isFeatured,
      featured_until: seed.featuredUntil ?? null,
      status: seed.status,
      linked_agent_href: seed.linkedAgentHref ?? "",
      linked_agent_label: seed.linkedAgentLabel ?? "",
      published_at: seed.publishedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await queryClient
      .from(BUSINESS_GUIDES_TABLE)
      .upsert(payload, { onConflict: "slug" });

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  revalidatePath("/initiatives/business-academy");
  revalidatePath("/learn");
  revalidatePath("/dashboard/admin/guides");

  return { ok: true };
}

export async function updateBusinessGuideAction(input: {
  id: string;
  status?: GuideStatus;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  topic?: GuideTopic;
}): Promise<GuideActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.status !== undefined) {
    updates.status = input.status;
    if (input.status === "published") {
      updates.published_at = new Date().toISOString();
    }
  }
  if (input.isFeatured !== undefined) updates.is_featured = input.isFeatured;
  if (input.featuredUntil !== undefined) updates.featured_until = input.featuredUntil;
  if (input.topic !== undefined) updates.topic = input.topic;

  const adminClient = createAdminClient();
  const queryClient = adminClient ?? auth.supabase;

  const { error } = await queryClient
    .from(BUSINESS_GUIDES_TABLE)
    .update(updates)
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/initiatives/business-academy");
  revalidatePath("/learn");
  revalidatePath("/dashboard/admin/guides");

  return { ok: true };
}
