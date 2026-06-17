import type { LucideIcon } from "lucide-react";
import {
  Eye,
  Package,
  PiggyBank,
  ShoppingCart,
  Smartphone,
  Target,
  Users,
  Wallet,
} from "lucide-react";

export type PainPointId =
  | "visibility"
  | "sales"
  | "pricing"
  | "inventory"
  | "customers"
  | "digital"
  | "cashflow"
  | "staffing";

export type PainPoint = {
  id: PainPointId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const painPoints: PainPoint[] = [
  {
    id: "visibility",
    label: "Low visibility",
    description: "Not enough people know about my business",
    icon: Eye,
  },
  {
    id: "sales",
    label: "Slow sales",
    description: "Customers aren't buying enough or often enough",
    icon: ShoppingCart,
  },
  {
    id: "pricing",
    label: "Pricing struggles",
    description: "Unsure what to charge or losing margin",
    icon: PiggyBank,
  },
  {
    id: "inventory",
    label: "Stock & inventory",
    description: "Overstock, shortages, or waste hurting profits",
    icon: Package,
  },
  {
    id: "customers",
    label: "Customer retention",
    description: "Hard to keep customers coming back",
    icon: Users,
  },
  {
    id: "digital",
    label: "Weak online presence",
    description: "No website, social media, or digital sales",
    icon: Smartphone,
  },
  {
    id: "cashflow",
    label: "Cash flow pressure",
    description: "Money tight between payables and receivables",
    icon: Wallet,
  },
  {
    id: "staffing",
    label: "Team & operations",
    description: "Hiring, training, or process bottlenecks",
    icon: Target,
  },
];

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  timeframe: string;
  agentLink?: string;
  agentLabel?: string;
};

export type GrowthPlan = {
  summary: string;
  impact: string;
  actions: ActionItem[];
  challengeLabel?: string;
};

export const growthPlans: Record<PainPointId, GrowthPlan> = {
  visibility: {
    summary:
      "Your business offers strong products but isn't visible enough to the right buyers. Focus on local discovery and consistent promotion.",
    impact: "Potential +25–40% enquiries in 30 days",
    actions: [
      {
        id: "v1",
        title: "Complete your AfriGrow profile",
        description:
          "A full profile helps you appear in the marketplace and builds trust with new buyers.",
        priority: "high",
        timeframe: "This week",
        agentLink: "/dashboard/profile",
        agentLabel: "Profile Agent",
      },
      {
        id: "v2",
        title: "Post 3x weekly on social media",
        description:
          "Share product photos, customer stories, and behind-the-scenes content consistently.",
        priority: "high",
        timeframe: "Ongoing",
        agentLink: "/dashboard/marketing",
        agentLabel: "Marketing Agent",
      },
      {
        id: "v3",
        title: "List on local business directories",
        description:
          "Register on Google Business, local WhatsApp groups, and industry associations.",
        priority: "medium",
        timeframe: "2 weeks",
      },
      {
        id: "v4",
        title: "Partner with complementary businesses",
        description:
          "Cross-promote with event planners, tailors, or retailers who share your audience.",
        priority: "medium",
        timeframe: "1 month",
        agentLink: "/dashboard/matching",
        agentLabel: "Matching",
      },
    ],
  },
  sales: {
    summary:
      "Sales are inconsistent — likely a mix of visibility, follow-up gaps, and offer clarity. Tighten your funnel from enquiry to close.",
    impact: "Potential +15–30% conversion rate",
    actions: [
      {
        id: "s1",
        title: "Create a clear weekend/seasonal offer",
        description: "One simple promotion with a deadline drives urgency.",
        priority: "high",
        timeframe: "This week",
        agentLink: "/dashboard/marketing",
        agentLabel: "Marketing Agent",
      },
      {
        id: "s2",
        title: "Follow up every enquiry within 24 hours",
        description: "Use CRM reminders so no lead goes cold.",
        priority: "high",
        timeframe: "Immediately",
        agentLink: "/dashboard/crm",
        agentLabel: "CRM",
      },
      {
        id: "s3",
        title: "Bundle products or services",
        description: "Increase average order value with fabric + tailoring packages.",
        priority: "medium",
        timeframe: "2 weeks",
      },
      {
        id: "s4",
        title: "Ask happy customers for referrals",
        description: "Word-of-mouth is powerful — offer a small thank-you discount.",
        priority: "medium",
        timeframe: "Ongoing",
      },
    ],
  },
  pricing: {
    summary:
      "Pricing affects both sales volume and margin. You need clearer cost tracking and competitive positioning.",
    impact: "Protect margin while staying competitive",
    actions: [
      {
        id: "p1",
        title: "Calculate true cost per unit",
        description: "Include fabric, labour, transport, and overhead in your base cost.",
        priority: "high",
        timeframe: "This week",
      },
      {
        id: "p2",
        title: "Define wholesale vs retail tiers",
        description: "Separate pricing for walk-in, bulk, and corporate clients.",
        priority: "high",
        timeframe: "1 week",
      },
      {
        id: "p3",
        title: "Review competitor pricing monthly",
        description: "Stay aware of market rates without racing to the bottom.",
        priority: "medium",
        timeframe: "Monthly",
      },
    ],
  },
  inventory: {
    summary:
      "Inventory issues tie up cash and create missed sales. Better forecasting and supplier relationships will help.",
    impact: "Reduce dead stock by 20%+",
    actions: [
      {
        id: "i1",
        title: "Track best & slow sellers weekly",
        description: "Know what to reorder and what to discount.",
        priority: "high",
        timeframe: "Weekly",
      },
      {
        id: "i2",
        title: "Negotiate flexible reorder terms",
        description: "Use Matching to find suppliers with better MOQ or credit terms.",
        priority: "high",
        timeframe: "2 weeks",
        agentLink: "/dashboard/matching",
        agentLabel: "Matching",
      },
      {
        id: "i3",
        title: "Run a clearance sale on slow stock",
        description: "Free cash tied up in fabrics that aren't moving.",
        priority: "medium",
        timeframe: "This month",
        agentLink: "/dashboard/marketing",
        agentLabel: "Marketing Agent",
      },
    ],
  },
  customers: {
    summary:
      "Acquiring customers costs more than keeping them. Build simple loyalty and follow-up habits.",
    impact: "Increase repeat purchases by 20%+",
    actions: [
      {
        id: "c1",
        title: "Log every customer in CRM",
        description: "Capture name, purchase, and preferred contact method.",
        priority: "high",
        timeframe: "Immediately",
        agentLink: "/dashboard/crm",
        agentLabel: "CRM",
      },
      {
        id: "c2",
        title: "Send thank-you messages post-purchase",
        description: "WhatsApp a thank-you and ask if they need anything else.",
        priority: "high",
        timeframe: "Ongoing",
      },
      {
        id: "c3",
        title: "Create a simple loyalty offer",
        description: "E.g. 10% off after 3 purchases or referral reward.",
        priority: "medium",
        timeframe: "2 weeks",
      },
    ],
  },
  digital: {
    summary:
      "A weak online presence limits reach. Start small: profile, social, and WhatsApp commerce.",
    impact: "Reach customers beyond your physical location",
    actions: [
      {
        id: "d1",
        title: "Polish your business profile online",
        description: "Photos, services, contact details — make it professional.",
        priority: "high",
        timeframe: "This week",
        agentLink: "/dashboard/profile",
        agentLabel: "Profile Agent",
      },
      {
        id: "d2",
        title: "Enable WhatsApp Business catalog",
        description: "Let customers browse fabrics and place orders via chat.",
        priority: "high",
        timeframe: "1 week",
      },
      {
        id: "d3",
        title: "Generate 2 weeks of social content",
        description: "Batch-create posts with the Marketing Agent.",
        priority: "medium",
        timeframe: "This week",
        agentLink: "/dashboard/marketing",
        agentLabel: "Marketing Agent",
      },
    ],
  },
  cashflow: {
    summary:
      "Cash flow gaps often come from late payments, overstock, or seasonal dips. Tighten collections and plan ahead.",
    impact: "Improve liquidity within 30–60 days",
    actions: [
      {
        id: "f1",
        title: "Invoice promptly & follow up",
        description: "Send reminders for overdue payments via CRM.",
        priority: "high",
        timeframe: "Immediately",
        agentLink: "/dashboard/crm",
        agentLabel: "CRM",
      },
      {
        id: "f2",
        title: "Review grant & funding options",
        description: "Check eligibility for SME grants and prepare documents.",
        priority: "high",
        timeframe: "2 weeks",
        agentLink: "/dashboard/funding",
        agentLabel: "Funding Agent",
      },
      {
        id: "f3",
        title: "Reduce slow-moving inventory",
        description: "Convert stock to cash with targeted promotions.",
        priority: "medium",
        timeframe: "This month",
      },
    ],
  },
  staffing: {
    summary:
      "Operational bottlenecks limit growth. Document processes and consider part-time or contract help for peak periods.",
    impact: "Free up your time for sales & strategy",
    actions: [
      {
        id: "t1",
        title: "Write simple SOPs for key tasks",
        description: "Order fulfilment, customer greeting, stock counts.",
        priority: "high",
        timeframe: "2 weeks",
      },
      {
        id: "t2",
        title: "Identify tasks to delegate",
        description: "Social posting, delivery coordination, basic admin.",
        priority: "medium",
        timeframe: "1 month",
      },
      {
        id: "t3",
        title: "Use automation for follow-ups",
        description: "CRM reminders reduce manual chasing of customers.",
        priority: "medium",
        timeframe: "This week",
        agentLink: "/dashboard/crm",
        agentLabel: "CRM",
      },
    ],
  },
};

export const priorityStyles = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-accent-light text-accent border-accent/30",
  low: "bg-primary-light text-primary border-primary/20",
};

function inferPainPointFromChallenge(challenge: string): PainPointId {
  const lower = challenge.toLowerCase();
  const rules: [RegExp, PainPointId][] = [
    [/\b(credit|fund|loan|grant|capital|financ|borrow|investment|cash\s?flow|liquidity)\b/, "cashflow"],
    [/\b(customer|retention|loyalty|churn|repeat)\b/, "customers"],
    [/\b(price|pricing|margin|cost)\b/, "pricing"],
    [/\b(stock|inventory|warehouse|supply)\b/, "inventory"],
    [/\b(visible|awareness|marketing|brand|reach)\b/, "visibility"],
    [/\b(sales|revenue|sell|conversion)\b/, "sales"],
    [/\b(digital|online|website|social|e-?commerce)\b/, "digital"],
    [/\b(team|staff|hire|training|operation|process)\b/, "staffing"],
  ];

  for (const [pattern, id] of rules) {
    if (pattern.test(lower)) return id;
  }
  return "cashflow";
}

export function buildCustomGrowthPlan(
  challenge: string,
  businessName?: string,
): GrowthPlan {
  const trimmed = challenge.trim();
  const baseId = inferPainPointFromChallenge(trimmed);
  const base = growthPlans[baseId];
  const who = businessName?.trim() || "your business";

  return {
    summary: `We analysed your challenge — "${trimmed}" — and mapped it to practical steps for ${who}. ${base.summary}`,
    impact: base.impact,
    challengeLabel: trimmed,
    actions: [
      {
        id: "custom-primary",
        title: `Tackle your challenge: ${trimmed}`,
        description: `Make this the focus for ${who} this week. Break it into smaller tasks and track progress here.`,
        priority: "high",
        timeframe: "This week",
        ...(baseId === "cashflow" && {
          agentLink: "/dashboard/funding",
          agentLabel: "Funding Agent",
        }),
      },
      ...base.actions.map((action, i) => ({
        ...action,
        id: `custom-${i}`,
      })),
    ],
  };
}
