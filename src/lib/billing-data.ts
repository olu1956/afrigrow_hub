export type PlanId = "starter" | "growth" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
};

export type InvoiceStatus = "paid" | "pending" | "failed" | "draft" | "overdue" | "cancelled";

export type QuotationStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: InvoiceStatus;
};

export type Quotation = {
  id: string;
  date: string;
  clientName: string;
  clientEmail?: string;
  description: string;
  amount: string;
  status: QuotationStatus;
};

export type UsageLimit = {
  label: string;
  used: number;
  limit: number | null;
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for new businesses testing the platform.",
    features: [
      "Business profile",
      "1 AI agent",
      "Basic marketplace listing",
      "5 CRM contacts",
    ],
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "£10",
    period: "/ month",
    description: "For active SMEs ready to promote and connect.",
    features: [
      "All 6 AI agents",
      "Unlimited marketing content",
      "Priority matching",
      "Funding readiness tools",
      "Full CRM & automation",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For manufacturers, chains, and event companies at scale.",
    features: [
      "Multi-location profiles",
      "Dedicated agent tuning",
      "API & integrations",
      "Team seats & roles",
      "Priority support",
    ],
    highlighted: false,
  },
];

export const quotations: Quotation[] = [
  {
    id: "QUO-2026-A1B2C3",
    date: "10 Jun 2026",
    clientName: "Corporate Wear Solutions",
    description: "Bulk uniform fabric quote",
    amount: "£4,850.00",
    status: "sent",
  },
  {
    id: "QUO-2026-D4E5F6",
    date: "28 May 2026",
    clientName: "Elegance Events NG",
    description: "Wedding décor package + 2 more",
    amount: "£1,240.00",
    status: "accepted",
  },
  {
    id: "QUO-2026-G7H8I9",
    date: "15 May 2026",
    clientName: "Diaspora Gift Co.",
    description: "Wholesale adire bundle",
    amount: "£920.00",
    status: "declined",
  },
];

export const invoices: Invoice[] = [
  {
    id: "INV-2026-004",
    date: "1 Jun 2026",
    description: "Growth plan — June 2026",
    amount: "£10.00",
    status: "paid",
  },
  {
    id: "INV-2026-003",
    date: "1 May 2026",
    description: "Growth plan — May 2026",
    amount: "£10.00",
    status: "paid",
  },
  {
    id: "INV-2026-002",
    date: "1 Apr 2026",
    description: "Growth plan — April 2026",
    amount: "£10.00",
    status: "paid",
  },
  {
    id: "INV-2026-001",
    date: "15 Mar 2026",
    description: "Growth plan — trial conversion",
    amount: "£10.00",
    status: "paid",
  },
];

export const growthUsage: UsageLimit[] = [
  { label: "AI agent sessions", used: 24, limit: null },
  { label: "Marketing posts generated", used: 18, limit: null },
  { label: "CRM contacts", used: 48, limit: null },
  { label: "Match enquiries", used: 11, limit: 50 },
  { label: "Directory profile views", used: 486, limit: null },
];

export const starterUsage: UsageLimit[] = [
  { label: "AI agent sessions", used: 6, limit: 10 },
  { label: "Marketing posts generated", used: 3, limit: 5 },
  { label: "CRM contacts", used: 5, limit: 5 },
  { label: "Match enquiries", used: 2, limit: 5 },
  { label: "Directory profile views", used: 86, limit: 200 },
];

export function planIdFromName(planName: string): PlanId {
  const normalized = planName.toLowerCase();
  if (normalized.includes("enterprise")) return "enterprise";
  if (normalized.includes("starter") || normalized.includes("free")) return "starter";
  return "growth";
}

export function getPlanById(id: PlanId): Plan {
  return plans.find((p) => p.id === id) ?? plans[1];
}

export function getUsageForPlan(id: PlanId): UsageLimit[] {
  return id === "starter" ? starterUsage : growthUsage;
}

export function nextBillingDate(): string {
  return "1 Jul 2026";
}
