import type { Metadata } from "next";
import { FundingCatalogueAdmin } from "@/components/admin/FundingCatalogueAdmin";

export const metadata: Metadata = {
  title: "Funding catalogue — AfriGrow Hub Admin",
  description: "Upload and publish funding programmes by country.",
};

export default function FundingCatalogueAdminPage() {
  return <FundingCatalogueAdmin />;
}
