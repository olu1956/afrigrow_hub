export type FundingType = "grant" | "loan" | "accelerator" | "equity";

export type GrantOpportunity = {
  id: string;
  name: string;
  provider: string;
  type: FundingType;
  amount: string;
  region: string;
  deadline: string;
  eligibility: string;
  description: string;
  matchScore: number;
  sectors: string[];
};

export type ReadinessItem = {
  id: string;
  label: string;
  description: string;
  category: "documents" | "financials" | "profile" | "compliance";
  required: boolean;
};

export const fundingTypeFilters: { value: FundingType | "all"; label: string }[] = [
  { value: "all", label: "All opportunities" },
  { value: "grant", label: "Grants" },
  { value: "loan", label: "Loans" },
  { value: "accelerator", label: "Accelerators" },
  { value: "equity", label: "Equity / investment" },
];

export const typeLabels: Record<FundingType, string> = {
  grant: "Grant",
  loan: "Loan",
  accelerator: "Accelerator",
  equity: "Equity",
};

export const typeStyles: Record<FundingType, string> = {
  grant: "bg-primary-light text-primary",
  loan: "bg-blue-50 text-blue-700",
  accelerator: "bg-accent-light text-accent",
  equity: "bg-purple-50 text-purple-700",
};

export const readinessItems: ReadinessItem[] = [
  {
    id: "r1",
    label: "Business registration (CAC)",
    description: "Certificate of incorporation or business name registration.",
    category: "compliance",
    required: true,
  },
  {
    id: "r2",
    label: "Valid bank account in business name",
    description: "Most funders require a dedicated business account.",
    category: "financials",
    required: true,
  },
  {
    id: "r3",
    label: "6 months of transaction records",
    description: "Bank statements or mobile money records showing revenue.",
    category: "financials",
    required: true,
  },
  {
    id: "r4",
    label: "Complete AfriGrow business profile",
    description: "Full profile with services, location, and contact details.",
    category: "profile",
    required: true,
  },
  {
    id: "r5",
    label: "Business plan (1–2 pages)",
    description: "Summary of model, market, and use of funds.",
    category: "documents",
    required: true,
  },
  {
    id: "r6",
    label: "Tax identification (TIN)",
    description: "FIRS tax ID or equivalent in your country.",
    category: "compliance",
    required: false,
  },
  {
    id: "r7",
    label: "Pitch deck or product photos",
    description: "Visual proof of your product or service offering.",
    category: "documents",
    required: false,
  },
  {
    id: "r8",
    label: "Director ID documents",
    description: "Valid ID for business owner or directors.",
    category: "documents",
    required: true,
  },
];

export const defaultCompletedItems = new Set(["r1", "r4", "r5", "r8"]);

export const grantOpportunities: GrantOpportunity[] = [
  {
    id: "g1",
    name: "Tony Elumelu Foundation Entrepreneurship Programme",
    provider: "Tony Elumelu Foundation",
    type: "grant",
    amount: "$5,000 seed grant",
    region: "Africa-wide",
    deadline: "Mar 2027",
    eligibility: "African entrepreneurs, early-stage businesses",
    description:
      "Seed funding, mentorship, and training for African entrepreneurs building scalable businesses.",
    matchScore: 94,
    sectors: ["Retail", "Manufacturing", "Services"],
  },
  {
    id: "g2",
    name: "Bank of Industry (BOI) SME Loan",
    provider: "Bank of Industry Nigeria",
    type: "loan",
    amount: "Up to ₦10M",
    region: "Nigeria",
    deadline: "Rolling",
    eligibility: "Registered Nigerian SMEs with 2+ years operations",
    description:
      "Low-interest loans for equipment, working capital, and business expansion.",
    matchScore: 88,
    sectors: ["Manufacturing", "Retail", "Agro-processing"],
  },
  {
    id: "g3",
    name: "Google for Startups Accelerator Africa",
    provider: "Google",
    type: "accelerator",
    amount: "Equity-free support",
    region: "Africa",
    deadline: "Jun 2026",
    eligibility: "Tech-enabled startups, seed to Series A",
    description:
      "3-month accelerator with mentorship, Google Cloud credits, and investor access.",
    matchScore: 72,
    sectors: ["Tech", "E-commerce", "Services"],
  },
  {
    id: "g4",
    name: "Lagos State Employment Trust Fund (LSETF)",
    provider: "Lagos State Government",
    type: "loan",
    amount: "₦500K – ₦5M",
    region: "Lagos, Nigeria",
    deadline: "Rolling",
    eligibility: "Lagos-based SMEs, 1+ year in business",
    description:
      "Affordable loans for Lagos businesses to create jobs and expand operations.",
    matchScore: 91,
    sectors: ["Retail", "Services", "Manufacturing"],
  },
  {
    id: "g5",
    name: "Africa MSME Grant Fund",
    provider: "African Development Bank",
    type: "grant",
    amount: "$2,000 – $15,000",
    region: "West Africa",
    deadline: "Sep 2026",
    eligibility: "Micro & small enterprises, women-led preferred",
    description:
      "Grants for MSMEs to improve productivity, digitise, and access new markets.",
    matchScore: 86,
    sectors: ["Retail", "Manufacturing", "Food"],
  },
  {
    id: "g6",
    name: "She Leads Africa Fund",
    provider: "She Leads Africa",
    type: "equity",
    amount: "$50K – $250K",
    region: "Africa",
    deadline: "Dec 2026",
    eligibility: "Women-led businesses with revenue traction",
    description:
      "Equity investment and growth support for ambitious women entrepreneurs.",
    matchScore: 79,
    sectors: ["Retail", "Services", "Tech"],
  },
];

export const categoryLabels = {
  documents: "Documents",
  financials: "Financials",
  profile: "Profile",
  compliance: "Compliance",
};

export function calculateReadiness(completed: Set<string>): number {
  const required = readinessItems.filter((i) => i.required);
  const done = required.filter((i) => completed.has(i.id)).length;
  return Math.round((done / required.length) * 100);
}
