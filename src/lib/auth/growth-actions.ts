"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import {
  PAIN_POINT_REPORTS_TABLE,
  type PainPointChallengeType,
  type PainPointReport,
} from "@/lib/database/pain-point-reports";
import type { GrowthPlan } from "@/lib/growth-data";
import {
  applyCompletionToActions,
  calculateGrowthScore,
  extractWeeklyTasks,
  growthPlanToReportFields,
  reportToGrowthPlan,
} from "@/lib/growth/report-mapper";
import { createClient } from "@/lib/supabase/server";

export type GrowthActionResult = {
  ok: boolean;
  error?: string;
};

export type PainPointReportResult = GrowthActionResult & {
  report?: PainPointReport;
  plan?: GrowthPlan;
  completedActionIds?: string[];
  warning?: string;
};

async function getUserBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ businessId: string | null; error?: string }> {
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { businessId: null, error: error.message };
  }

  if (!data?.id) {
    return { businessId: null, error: "Business profile not found. Complete your profile first." };
  }

  return { businessId: data.id };
}

function mapReportRow(row: PainPointReport): PainPointReport {
  return {
    ...row,
    root_causes: Array.isArray(row.root_causes) ? row.root_causes : [],
    action_plan: Array.isArray(row.action_plan) ? row.action_plan : [],
    weekly_tasks: Array.isArray(row.weekly_tasks) ? row.weekly_tasks : [],
  };
}

function isMissingTableError(message: string): boolean {
  return /pain_point_reports|schema cache|relation .* does not exist/i.test(message);
}

function formatGrowthDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Run migration 20260620160000_create_pain_point_reports.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

export async function getLatestPainPointReportAction(): Promise<PainPointReportResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from(PAIN_POINT_REPORTS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) {
      return { ok: true, warning: formatGrowthDbError(error.message) };
    }

    return { ok: false, error: formatGrowthDbError(error.message) };
  }

  if (!data) {
    return { ok: true };
  }

  const report = mapReportRow(data as PainPointReport);
  const completedActionIds = report.action_plan
    .filter((action) => action.completed)
    .map((action) => action.id);

  return {
    ok: true,
    report,
    plan: reportToGrowthPlan(report),
    completedActionIds,
  };
}

export async function savePainPointReportAction(input: {
  challengeType: PainPointChallengeType;
  plan: GrowthPlan;
}): Promise<PainPointReportResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { businessId, error: businessError } = await getUserBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: businessError };
  }

  const fields = growthPlanToReportFields(input.plan, input.challengeType);

  const { data, error } = await supabase
    .from(PAIN_POINT_REPORTS_TABLE)
    .insert({
      user_id: user.id,
      business_id: businessId,
      challenge_type: input.challengeType,
      ...fields,
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatGrowthDbError(error.message) };
  }

  revalidatePath("/dashboard/growth");

  const report = mapReportRow(data as PainPointReport);

  return {
    ok: true,
    report,
    plan: reportToGrowthPlan(report),
    completedActionIds: [],
  };
}

export async function updatePainPointReportProgressAction(input: {
  reportId: string;
  plan: GrowthPlan;
  completedActionIds: string[];
}): Promise<PainPointReportResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const completedIds = new Set(input.completedActionIds);
  const actionPlan = applyCompletionToActions(input.plan.actions, completedIds);
  const weeklyTasks = applyCompletionToActions(extractWeeklyTasks(input.plan.actions), completedIds);

  const { data, error } = await supabase
    .from(PAIN_POINT_REPORTS_TABLE)
    .update({
      action_plan: actionPlan,
      weekly_tasks: weeklyTasks,
      growth_score: calculateGrowthScore(actionPlan, completedIds),
    })
    .eq("id", input.reportId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatGrowthDbError(error.message) };
  }

  revalidatePath("/dashboard/growth");

  const report = mapReportRow(data as PainPointReport);

  return {
    ok: true,
    report,
    plan: reportToGrowthPlan(report),
    completedActionIds: input.completedActionIds,
  };
}