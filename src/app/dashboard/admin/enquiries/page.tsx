import type { Metadata } from "next";
import { EnterpriseEnquiriesAdmin } from "@/components/admin/EnterpriseEnquiriesAdmin";

export const metadata: Metadata = {
  title: "Inbound Leads — AfriGrow Hub",
  description: "Review contact messages, partner applications, and Enterprise enquiries.",
};

export default function EnterpriseEnquiriesAdminPage() {
  return <EnterpriseEnquiriesAdmin />;
}
