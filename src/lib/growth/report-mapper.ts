import type {
  PainPointReport,
  StoredActionItem,
  PainPointChallengeType,
} from "@/lib/database/pain-point-reports";
import {
  inferPainPointFromChallenge,
  type ActionItem,
  type GrowthPlan,
  type PainPointId,
} from "@/lib/growth-data";

const ROOT_CAUSES: Record<PainPointId, string[]> = {
  visibility: [
    "Limited local discovery channels",
    "Inconsistent or absent promotion",
    "Incomplete or outdated business presence online",
  ],
  sales: [
    "Weak follow-up on enquiries",
    "Unclear offers or pricing",
    "Not enough qualified traffic reaching your business",
  ],
  pricing: [
    "Costs not fully tracked before setting prices",
    "Competitor pricing used without margin checks",
    "Discounting without a clear strategy",
  ],
  inventory: [
    "Demand forecasting is inconsistent",
    "Slow-moving stock ties up cash",
    "Stock-outs on popular items",
  ],
  customers: [
    "No structured follow-up after purchase",
    "Limited loyalty or referral incentives",
    "Customer feedback is not captured regularly",
  ],
  digital: [
    "No consistent online sales or enquiry channel",
    "Social profiles are inactive or incomplete",
    "Buyers cannot easily find or trust you online",
  ],
  cashflow: [
    "Receivables arrive slower than payables",
    "Limited access to short-term finance",
    "Seasonal revenue swings without a buffer",
  ],
  staffing: [
    "Key tasks depend on one person",
    "Processes are undocumented or inconsistent",
    "Training gaps slow delivery or quality",
  ],
};

export function deriveRootCauses(
  challengeType: PainPointId | "custom",
  customChallenge?: string,
): string[] {
  if (challengeType === "custom" && customChallenge?.trim()) {
    const baseId = inferPainPointFromChallenge(customChallenge);
    return [customChallenge.trim(), ...ROOT_CAUSES[baseId].slice(0, 2)];
  }

  return ROOT_CAUSES[challengeType as PainPointId] ?? [];
}

export function extractWeeklyTasks(actions: ActionItem[]): ActionItem[] {
  const weekActions = actions.filter((action) =>
    /this week|immediately|ongoing/i.test(action.timeframe),
  );

  if (weekActions.length >= 2) {
    return weekActions.slice(0, 5);
  }

  return actions.filter((action) => action.priority === "high").slice(0, 3);
}

export function calculateGrowthScore(
  actions: StoredActionItem[],
  completedIds: Set<string>,
): number {
  if (actions.length === 0) return 0;
  const done = actions.filter((action) => completedIds.has(action.id)).length;
  return Math.round((done / actions.length) * 100);
}

export function applyCompletionToActions(
  actions: ActionItem[],
  completedIds: Set<string>,
): StoredActionItem[] {
  return actions.map((action) => ({
    ...action,
    completed: completedIds.has(action.id),
  }));
}

export function completedIdsFromActions(actions: StoredActionItem[]): Set<string> {
  return new Set(actions.filter((action) => action.completed).map((action) => action.id));
}

export function resolveChallengeType(
  selected: PainPointId | null,
  customChallenge: string,
): PainPointChallengeType {
  if (customChallenge.trim()) return "custom";
  return selected ?? "visibility";
}

const IMPACT_MARKER = "\n\nExpected impact: ";

export function serializeDiagnosis(plan: GrowthPlan): string {
  return `${plan.summary}${IMPACT_MARKER}${plan.impact}`;
}

export function splitDiagnosis(raw: string): { summary: string; impact: string } {
  const index = raw.indexOf(IMPACT_MARKER);
  if (index === -1) {
    return {
      summary: raw,
      impact: "Track progress as you complete each action",
    };
  }

  return {
    summary: raw.slice(0, index),
    impact: raw.slice(index + IMPACT_MARKER.length),
  };
}

export function growthPlanToReportFields(
  plan: GrowthPlan,
  challengeType: PainPointId | "custom",
  completedIds: Set<string> = new Set(),
) {
  const actionPlan = applyCompletionToActions(plan.actions, completedIds);
  const weeklyTasks = applyCompletionToActions(extractWeeklyTasks(plan.actions), completedIds);

  return {
    diagnosis: serializeDiagnosis(plan),
    root_causes: deriveRootCauses(challengeType, plan.challengeLabel),
    action_plan: actionPlan,
    weekly_tasks: weeklyTasks,
    growth_score: calculateGrowthScore(actionPlan, completedIds),
  };
}

export function reportToGrowthPlan(report: PainPointReport): GrowthPlan {
  const actions = report.action_plan.map(({ completed: _completed, ...action }) => action);
  const { summary, impact } = splitDiagnosis(report.diagnosis);

  return {
    summary,
    impact,
    challengeLabel:
      report.challenge_type === "custom"
        ? report.root_causes[0]
        : undefined,
    actions,
  };
}

export function formatReportDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}

export function parseEstimatedGrowthPercent(plan: GrowthPlan | null): number {
  if (!plan?.impact) return 18;

  const match = plan.impact.match(/\+(\d+)/);
  if (!match) return 18;

  return Number.parseInt(match[1], 10) || 18;
}
