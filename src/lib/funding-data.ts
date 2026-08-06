export type FundingType = "grant" | "loan" | "accelerator" | "equity";

export type BusinessStage = "idea" | "pre_revenue" | "early" | "growth" | "established";

export const businessStageOptions: { value: BusinessStage; label: string }[] = [
  { value: "idea", label: "Idea stage" },
  { value: "pre_revenue", label: "Pre-revenue / startup" },
  { value: "early", label: "Early revenue" },
  { value: "growth", label: "Growth stage" },
  { value: "established", label: "Established" },
];

export type FundingOpportunityDefinition = {
  id: string;
  name: string;
  provider: string;
  type: FundingType;
  amount: string;
  region: string;
  deadline: string;
  eligibility: string;
  description: string;
  applyUrl: string;
  sectors: string[];
  /** Normalized country keys plus region tokens: africa, west-africa, uk, nigeria, etc. */
  countryKeys: string[];
  eligibleStages: BusinessStage[];
  sectorKeys?: string[];
  fundingMin?: number;
  fundingMax?: number;
  fundingCurrency?: string;
};

export type MatchedGrantOpportunity = FundingOpportunityDefinition & {
  matchScore: number;
};

/** @deprecated Use MatchedGrantOpportunity — scores are computed at runtime. */
export type GrantOpportunity = MatchedGrantOpportunity;

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

export const FUNDING_DISCLAIMER =
  "AfriGrow helps you prepare and find programmes — funding decisions are made by each provider, not AfriGrow Hub.";

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

/** Start empty — checklist should reflect real progress, not demo pre-ticks. */
export const defaultCompletedItems = new Set<string>();

export const fundingOpportunities: FundingOpportunityDefinition[] = [
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
    applyUrl: "https://www.tonyelumelufoundation.org/programme",
    sectors: ["Retail", "Manufacturing", "Services"],
    countryKeys: ["africa"],
    eligibleStages: ["idea", "pre_revenue", "early"],
    sectorKeys: ["retail", "manufacturing", "services", "food", "tech", "other"],
    fundingMin: 0,
    fundingMax: 25_000,
    fundingCurrency: "USD",
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
    applyUrl: "https://www.boi.ng/",
    sectors: ["Manufacturing", "Retail", "Agro-processing"],
    countryKeys: ["nigeria"],
    eligibleStages: ["growth", "established"],
    sectorKeys: ["manufacturing", "retail", "food", "services"],
    fundingMin: 1_000_000,
    fundingMax: 10_000_000,
    fundingCurrency: "NGN",
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
    applyUrl: "https://startup.google.com/programs/accelerator/africa/",
    sectors: ["Tech", "E-commerce", "Services"],
    countryKeys: ["africa"],
    eligibleStages: ["pre_revenue", "early", "growth"],
    sectorKeys: ["tech", "services", "retail"],
    fundingMin: 0,
    fundingMax: 500_000,
    fundingCurrency: "USD",
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
    applyUrl: "https://lsetf.ng/",
    sectors: ["Retail", "Services", "Manufacturing"],
    countryKeys: ["nigeria"],
    eligibleStages: ["early", "growth", "established"],
    sectorKeys: ["retail", "services", "manufacturing", "food", "events"],
    fundingMin: 500_000,
    fundingMax: 5_000_000,
    fundingCurrency: "NGN",
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
    applyUrl: "https://www.afdb.org/en/topics-and-sectors/initiatives-partnerships/african-development-bank-group-msme-initiative",
    sectors: ["Retail", "Manufacturing", "Food"],
    countryKeys: ["west-africa"],
    eligibleStages: ["early", "growth"],
    sectorKeys: ["retail", "manufacturing", "food", "services"],
    fundingMin: 2_000,
    fundingMax: 15_000,
    fundingCurrency: "USD",
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
    applyUrl: "https://sheleadsafrica.org/",
    sectors: ["Retail", "Services", "Tech"],
    countryKeys: ["africa"],
    eligibleStages: ["growth", "established"],
    sectorKeys: ["retail", "services", "tech", "food", "events"],
    fundingMin: 50_000,
    fundingMax: 250_000,
    fundingCurrency: "USD",
  },
  {
    id: "uk1",
    name: "Start Up Loans",
    provider: "British Business Bank",
    type: "loan",
    amount: "£500 – £25,000",
    region: "United Kingdom",
    deadline: "Rolling",
    eligibility: "UK businesses trading less than 3 years",
    description:
      "Government-backed personal loans for business owners with free mentoring and support.",
    applyUrl: "https://www.startuploans.co.uk/",
    sectors: ["Retail", "Services", "Events", "Food"],
    countryKeys: ["uk"],
    eligibleStages: ["idea", "pre_revenue", "early", "growth"],
    sectorKeys: ["retail", "services", "events", "food", "tech", "manufacturing", "other"],
    fundingMin: 500,
    fundingMax: 25_000,
    fundingCurrency: "GBP",
  },
  {
    id: "uk2",
    name: "Growth Guarantee Scheme",
    provider: "British Business Bank",
    type: "loan",
    amount: "£25,000 – £2M",
    region: "United Kingdom",
    deadline: "Rolling",
    eligibility: "UK SMEs seeking growth or working capital finance",
    description:
      "Government-backed guarantee to help businesses access bank lending for expansion.",
    applyUrl: "https://www.british-business-bank.co.uk/business-guidance/guidance-articles/finance/growth-guarantee-scheme",
    sectors: ["Manufacturing", "Services", "Retail"],
    countryKeys: ["uk"],
    eligibleStages: ["growth", "established"],
    sectorKeys: ["manufacturing", "services", "retail", "events", "food"],
    fundingMin: 25_000,
    fundingMax: 2_000_000,
    fundingCurrency: "GBP",
  },
  {
    id: "uk3",
    name: "UK Shared Prosperity Fund (local grants)",
    provider: "UK Government / local councils",
    type: "grant",
    amount: "Varies by council",
    region: "United Kingdom",
    deadline: "Rolling",
    eligibility: "UK SMEs — check your local council for open calls",
    description:
      "Place-based grants for business growth, skills, and community projects across the UK.",
    applyUrl: "https://www.gov.uk/government/collections/uk-shared-prosperity-fund-prospectus",
    sectors: ["Retail", "Services", "Events", "Manufacturing"],
    countryKeys: ["uk"],
    eligibleStages: ["early", "growth", "established"],
    sectorKeys: ["retail", "services", "events", "manufacturing", "food", "other"],
    fundingMin: 1_000,
    fundingMax: 100_000,
    fundingCurrency: "GBP",
  },
  {
    id: "uk4",
    name: "Prince's Trust Enterprise Programme",
    provider: "The Prince's Trust",
    type: "grant",
    amount: "Up to £5,000 + mentoring",
    region: "United Kingdom",
    deadline: "Rolling",
    eligibility: "UK residents aged 18–30 starting or growing a business",
    description:
      "Grants, training, and mentoring for young entrepreneurs launching or scaling a venture.",
    applyUrl: "https://www.princes-trust.org.uk/help-for-young-people/support-starting-business",
    sectors: ["Retail", "Services", "Events", "Tech"],
    countryKeys: ["uk"],
    eligibleStages: ["idea", "pre_revenue", "early"],
    sectorKeys: ["retail", "services", "events", "tech", "food", "other"],
    fundingMin: 0,
    fundingMax: 5_000,
    fundingCurrency: "GBP",
  },
  {
    id: "uk5",
    name: "Innovate UK Smart Grants",
    provider: "Innovate UK",
    type: "grant",
    amount: "£25,000 – £500,000",
    region: "United Kingdom",
    deadline: "Periodic calls",
    eligibility: "UK businesses with innovative products or services",
    description:
      "R&D grants for game-changing and commercially viable innovation projects.",
    applyUrl: "https://www.ukri.org/opportunity/innovate-uk-smart-grants/",
    sectors: ["Tech", "Manufacturing", "Services"],
    countryKeys: ["uk"],
    eligibleStages: ["early", "growth", "established"],
    sectorKeys: ["tech", "manufacturing", "services"],
    fundingMin: 25_000,
    fundingMax: 500_000,
    fundingCurrency: "GBP",
  },
  {
    id: "gh1",
    name: "GIRSAL-backed SME Facility",
    provider: "Ghana Incentive-Based Risk Sharing System",
    type: "loan",
    amount: "Varies by partner bank",
    region: "Ghana",
    deadline: "Rolling",
    eligibility: "Registered Ghanaian SMEs via partner banks",
    description:
      "Credit guarantee scheme helping Ghanaian SMEs access bank loans at better terms.",
    applyUrl: "https://girsal.com.gh/",
    sectors: ["Manufacturing", "Retail", "Agro-processing"],
    countryKeys: ["ghana"],
    eligibleStages: ["early", "growth", "established"],
    sectorKeys: ["manufacturing", "retail", "food", "services"],
    fundingMin: 50_000,
    fundingMax: 2_000_000,
    fundingCurrency: "GHS",
  },
  {
    id: "ke1",
    name: "Youth Enterprise Development Fund",
    provider: "Government of Kenya",
    type: "loan",
    amount: "Up to KSh 5M",
    region: "Kenya",
    deadline: "Rolling",
    eligibility: "Kenyan youth-led enterprises (18–35)",
    description:
      "Affordable credit for young entrepreneurs to start or expand a business in Kenya.",
    applyUrl: "https://www.youthfund.go.ke/",
    sectors: ["Retail", "Services", "Manufacturing"],
    countryKeys: ["kenya"],
    eligibleStages: ["idea", "pre_revenue", "early", "growth"],
    sectorKeys: ["retail", "services", "manufacturing", "tech", "food"],
    fundingMin: 100_000,
    fundingMax: 5_000_000,
    fundingCurrency: "KES",
  },
];

/** @deprecated Use fundingOpportunities — match scores are computed at runtime. */
export const grantOpportunities = fundingOpportunities;

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
