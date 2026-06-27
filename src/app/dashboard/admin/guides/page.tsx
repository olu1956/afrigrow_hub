import type { Metadata } from "next";
import { BusinessGuidesAdmin } from "@/components/admin/BusinessGuidesAdmin";

export const metadata: Metadata = {
  title: "Business Guides — AfriGrow Hub Admin",
  description: "Publish and feature SME learning guides.",
};

export default function BusinessGuidesAdminPage() {
  return <BusinessGuidesAdmin />;
}
