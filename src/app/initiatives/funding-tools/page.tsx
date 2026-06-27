import type { Metadata } from "next";
import { CheckCircle2, ClipboardList, PiggyBank, Search } from "lucide-react";
import { InitiativePage } from "@/components/landing/InitiativePage";

export const metadata: Metadata = {
  title: "Funding Tools — AfriGrow Hub",
  description:
    "Funding readiness checklists, grant matching, and finance tools for African SMEs.",
};

export default function FundingToolsPage() {
  return (
    <InitiativePage
      eyebrow="Initiatives"
      title="Funding Tools"
      description="Everything you need to get funding-ready — readiness checklists, grant matching, application support, and progress tracking built into your AfriGrow dashboard."
      highlights={[
        {
          icon: ClipboardList,
          title: "Readiness checklist",
          description:
            "Track documents, financials, and compliance items funders expect to see.",
        },
        {
          icon: Search,
          title: "Grant & loan matcher",
          description:
            "Filter opportunities by region, sector, amount, and eligibility criteria.",
        },
        {
          icon: PiggyBank,
          title: "Potential funding view",
          description:
            "See matched opportunities and estimated funding potential at a glance.",
        },
        {
          icon: CheckCircle2,
          title: "Application tracker",
          description:
            "Draft applications, save progress, and prepare submissions with guided support.",
        },
      ]}
      steps={[
        {
          title: "Open the Finance Agent",
          description:
            "From your dashboard, launch the Finance & Funding Agent workspace.",
        },
        {
          title: "Complete your checklist",
          description:
            "Tick off readiness items and watch your funding score improve.",
        },
        {
          title: "Browse and apply",
          description:
            "Explore matched grants and loans, then start applications when you're ready.",
        },
      ]}
      cta={{
        label: "Open funding tools",
        href: "/dashboard/funding",
        secondary: { label: "Create free account", href: "/signup" },
      }}
    />
  );
}
