export type TimeRange = "7d" | "30d" | "90d";

export const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export type OverviewStat = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type AgentUsage = {
  agent: string;
  sessions: number;
  actions: number;
  color: string;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  date: string;
};

type AnalyticsSnapshot = {
  overview: OverviewStat[];
  profileViews: ChartPoint[];
  marketingReach: ChartPoint[];
  agentUsage: AgentUsage[];
  milestones: Milestone[];
};

const snapshots: Record<TimeRange, AnalyticsSnapshot> = {
  "7d": {
    overview: [
      { label: "Profile views", value: "124", change: "+18% vs prior week", positive: true },
      { label: "Marketing reach", value: "340", change: "+24 new impressions", positive: true },
      { label: "New contacts", value: "6", change: "2 from matching", positive: true },
      { label: "Match enquiries", value: "3", change: "1 pending reply", positive: false },
    ],
    profileViews: [
      { label: "Mon", value: 12 },
      { label: "Tue", value: 18 },
      { label: "Wed", value: 15 },
      { label: "Thu", value: 22 },
      { label: "Fri", value: 19 },
      { label: "Sat", value: 24 },
      { label: "Sun", value: 14 },
    ],
    marketingReach: [
      { label: "Mon", value: 38 },
      { label: "Tue", value: 52 },
      { label: "Wed", value: 45 },
      { label: "Thu", value: 61 },
      { label: "Fri", value: 48 },
      { label: "Sat", value: 72 },
      { label: "Sun", value: 24 },
    ],
    agentUsage: [
      { agent: "Marketing", sessions: 8, actions: 14, color: "bg-primary" },
      { agent: "CRM", sessions: 5, actions: 11, color: "bg-accent" },
      { agent: "Matching", sessions: 4, actions: 6, color: "bg-primary-dark" },
      { agent: "Profile", sessions: 3, actions: 5, color: "bg-primary/60" },
      { agent: "Funding", sessions: 2, actions: 3, color: "bg-muted/40" },
      { agent: "Growth", sessions: 1, actions: 2, color: "bg-muted/30" },
    ],
    milestones: [
      {
        id: "m1",
        title: "Profile strength reached 70%",
        description: "Your profile is now visible in priority directory results.",
        date: "2 days ago",
      },
      {
        id: "m2",
        title: "First match enquiry sent",
        description: "You connected with Accra Fabrics Co. via Matching.",
        date: "4 days ago",
      },
      {
        id: "m3",
        title: "Marketing content published",
        description: "3 social posts generated and scheduled for the weekend sale.",
        date: "5 days ago",
      },
    ],
  },
  "30d": {
    overview: [
      { label: "Profile views", value: "486", change: "+32% vs prior month", positive: true },
      { label: "Marketing reach", value: "1,240", change: "+156 new impressions", positive: true },
      { label: "New contacts", value: "18", change: "6 from matching", positive: true },
      { label: "Match enquiries", value: "11", change: "4 converted to calls", positive: true },
    ],
    profileViews: [
      { label: "Wk 1", value: 98 },
      { label: "Wk 2", value: 112 },
      { label: "Wk 3", value: 134 },
      { label: "Wk 4", value: 142 },
    ],
    marketingReach: [
      { label: "Wk 1", value: 240 },
      { label: "Wk 2", value: 310 },
      { label: "Wk 3", value: 285 },
      { label: "Wk 4", value: 405 },
    ],
    agentUsage: [
      { agent: "Marketing", sessions: 24, actions: 48, color: "bg-primary" },
      { agent: "CRM", sessions: 18, actions: 36, color: "bg-accent" },
      { agent: "Matching", sessions: 14, actions: 22, color: "bg-primary-dark" },
      { agent: "Profile", sessions: 12, actions: 18, color: "bg-primary/60" },
      { agent: "Funding", sessions: 8, actions: 12, color: "bg-muted/40" },
      { agent: "Growth", sessions: 6, actions: 9, color: "bg-muted/30" },
    ],
    milestones: [
      {
        id: "m1",
        title: "Funding readiness hit 68%",
        description: "2 checklist items remaining before grant applications.",
        date: "1 week ago",
      },
      {
        id: "m2",
        title: "12 active matches",
        description: "Your matching score improved after profile updates.",
        date: "2 weeks ago",
      },
      {
        id: "m3",
        title: "CRM reached 48 contacts",
        description: "4 follow-ups are due this week.",
        date: "3 weeks ago",
      },
    ],
  },
  "90d": {
    overview: [
      { label: "Profile views", value: "1,280", change: "+48% vs prior quarter", positive: true },
      { label: "Marketing reach", value: "3,840", change: "+520 new impressions", positive: true },
      { label: "New contacts", value: "48", change: "14 from matching", positive: true },
      { label: "Match enquiries", value: "28", change: "9 converted to partnerships", positive: true },
    ],
    profileViews: [
      { label: "Jan", value: 320 },
      { label: "Feb", value: 410 },
      { label: "Mar", value: 550 },
    ],
    marketingReach: [
      { label: "Jan", value: 980 },
      { label: "Feb", value: 1240 },
      { label: "Mar", value: 1620 },
    ],
    agentUsage: [
      { agent: "Marketing", sessions: 62, actions: 124, color: "bg-primary" },
      { agent: "CRM", sessions: 48, actions: 96, color: "bg-accent" },
      { agent: "Matching", sessions: 38, actions: 58, color: "bg-primary-dark" },
      { agent: "Profile", sessions: 32, actions: 44, color: "bg-primary/60" },
      { agent: "Funding", sessions: 22, actions: 34, color: "bg-muted/40" },
      { agent: "Growth", sessions: 16, actions: 24, color: "bg-muted/30" },
    ],
    milestones: [
      {
        id: "m1",
        title: "Joined AfriGrow Hub",
        description: "Started on the Growth plan with all 6 AI agents.",
        date: "3 months ago",
      },
      {
        id: "m2",
        title: "First grant application drafted",
        description: "Finance Agent helped prepare a Tony Elumelu application.",
        date: "6 weeks ago",
      },
      {
        id: "m3",
        title: "Directory listing verified",
        description: "Your business profile is now verified in the directory.",
        date: "1 month ago",
      },
    ],
  },
};

export function getAnalyticsSnapshot(range: TimeRange): AnalyticsSnapshot {
  return snapshots[range];
}

export function maxChartValue(points: ChartPoint[]): number {
  return Math.max(...points.map((p) => p.value), 1);
}
