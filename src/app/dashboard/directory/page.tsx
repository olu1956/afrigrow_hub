import type { Metadata } from "next";
import { BusinessDirectory } from "@/components/directory/BusinessDirectory";

export const metadata: Metadata = {
  title: "Directory — AfriGrow Hub",
  description: "Browse verified African SME business listings across sectors and regions.",
};

export default function DirectoryPage() {
  return <BusinessDirectory />;
}
