import type { DashboardStats } from "@/lib/auth/dashboard-stats-actions";
import type { PlanId, UsageLimit } from "@/lib/billing-data";

/** Build plan usage rows from live Supabase counts. */
export function buildUsageForPlan(planId: PlanId, stats: DashboardStats): UsageLimit[] {
  const isStarter = planId === "starter";

  return [
    {
      label: "Marketing posts saved",
      used: stats.marketingCampaigns,
      limit: isStarter ? 5 : null,
    },
    {
      label: "CRM contacts",
      used: stats.crmContacts,
      limit: isStarter ? 5 : null,
    },
    {
      label: "Match enquiries",
      used: stats.matchEnquiries,
      limit: isStarter ? 5 : 50,
    },
    {
      label: "Client invoices",
      used: stats.invoicesCreated,
      limit: null,
    },
    {
      label: "Quotations",
      used: stats.quotationsCreated,
      limit: null,
    },
  ];
}
