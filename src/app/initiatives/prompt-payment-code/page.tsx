import type { Metadata } from "next";
import { Clock, FileCheck, HandCoins, ShieldCheck } from "lucide-react";
import { InitiativePage } from "@/components/landing/InitiativePage";

export const metadata: Metadata = {
  title: "Prompt Payment Code — AfriGrow Hub",
  description:
    "Get paid on time with prompt payment practices and tools for African SMEs.",
};

export default function PromptPaymentCodePage() {
  return (
    <InitiativePage
      eyebrow="Initiatives"
      title="Prompt Payment Code"
      description="Late payments hurt small businesses. AfriGrow Hub helps you set clear payment terms, follow up professionally, and build a reputation for reliable trading."
      highlights={[
        {
          icon: Clock,
          title: "Clear payment terms",
          description:
            "Template invoices and terms you can share with buyers and suppliers.",
        },
        {
          icon: HandCoins,
          title: "Follow-up workflows",
          description:
            "Use the CRM Agent to schedule polite payment reminders automatically.",
        },
        {
          icon: ShieldCheck,
          title: "Trusted trading",
          description:
            "Display prompt payment badges on your directory profile to build confidence.",
        },
        {
          icon: FileCheck,
          title: "Cash flow visibility",
          description:
            "Track outstanding invoices alongside your funding readiness checklist.",
        },
      ]}
      steps={[
        {
          title: "Set your standard terms",
          description:
            "Define payment windows (7, 14, or 30 days) and share them on every quote.",
        },
        {
          title: "Automate follow-ups",
          description:
            "Log deals in CRM and schedule WhatsApp or email reminders before due dates.",
        },
        {
          title: "Build your track record",
          description:
            "Consistent on-time settlement improves your profile for future funding.",
        },
      ]}
      cta={{
        label: "Open CRM tools",
        href: "/dashboard/crm",
        secondary: { label: "Join free", href: "/join" },
      }}
    />
  );
}
