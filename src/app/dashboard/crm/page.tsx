import type { Metadata } from "next";
import { CrmAgent } from "@/components/crm/CrmAgent";

export const metadata: Metadata = {
  title: "CRM — AfriGrow Hub",
  description: "Manage customer contacts and follow-ups for your African business.",
};

export default function CrmPage() {
  return <CrmAgent />;
}
