import type { Metadata } from "next";
import { BillingDashboard } from "@/components/billing/BillingDashboard";

export const metadata: Metadata = {
  title: "Billing — AfriGrow Hub",
  description: "Manage your subscription, invoices, and plan usage.",
};

export default function BillingPage() {
  return <BillingDashboard />;
}
