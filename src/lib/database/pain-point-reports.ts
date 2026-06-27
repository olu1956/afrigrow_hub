import type { PainPointId } from "@/lib/growth-data";

export type PainPointChallengeType = PainPointId | "custom";

export type StoredActionItem = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  timeframe: string;
  agentLink?: string;
  agentLabel?: string;
  completed?: boolean;
};

export type PainPointReport = {
  id: string;
  user_id: string;
  business_id: string;
  challenge_type: PainPointChallengeType;
  diagnosis: string;
  root_causes: string[];
  action_plan: StoredActionItem[];
  weekly_tasks: StoredActionItem[];
  growth_score: number;
  created_at: string;
};

export type PainPointReportInsert = Pick<
  PainPointReport,
  "user_id" | "business_id" | "challenge_type"
> &
  Partial<
    Pick<
      PainPointReport,
      "diagnosis" | "root_causes" | "action_plan" | "weekly_tasks" | "growth_score"
    >
  >;

export type PainPointReportUpdate = Partial<
  Pick<
    PainPointReport,
    "diagnosis" | "root_causes" | "action_plan" | "weekly_tasks" | "growth_score"
  >
>;

export const PAIN_POINT_REPORTS_TABLE = "pain_point_reports" as const;

export const PAIN_POINT_CHALLENGE_TYPES: PainPointChallengeType[] = [
  "visibility",
  "sales",
  "pricing",
  "inventory",
  "customers",
  "digital",
  "cashflow",
  "staffing",
  "custom",
];
