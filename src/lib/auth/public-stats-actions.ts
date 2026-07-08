"use server";

import { cookies } from "next/headers";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";

const VISITOR_COOKIE = "afrigrow_vid";

export type PublicSiteStats = {
  membersCount: number;
  visitsToday: number;
  visitsTotal: number;
};

const emptyStats: PublicSiteStats = {
  membersCount: 0,
  visitsToday: 0,
  visitsTotal: 0,
};

async function fetchPublicSiteStats(): Promise<PublicSiteStats> {
  if (!isSupabaseAuthEnabled()) {
    return emptyStats;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_site_stats");

  if (error || !data || typeof data !== "object") {
    return emptyStats;
  }

  const row = data as Record<string, unknown>;

  return {
    membersCount: typeof row.members_count === "number" ? row.members_count : 0,
    visitsToday: typeof row.visits_today === "number" ? row.visits_today : 0,
    visitsTotal: typeof row.visits_total === "number" ? row.visits_total : 0,
  };
}

export async function getPublicSiteStatsAction(): Promise<PublicSiteStats> {
  return fetchPublicSiteStats();
}

export async function trackSiteVisitAction(): Promise<void> {
  if (!isSupabaseAuthEnabled()) {
    return;
  }

  const cookieStore = await cookies();
  let visitorKey = cookieStore.get(VISITOR_COOKIE)?.value;

  if (!visitorKey) {
    visitorKey = crypto.randomUUID();
    cookieStore.set(VISITOR_COOKIE, visitorKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const supabase = await createClient();
  await supabase.rpc("record_site_visit", { p_visitor_key: visitorKey });
}
