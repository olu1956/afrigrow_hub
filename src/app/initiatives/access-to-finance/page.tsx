import type { Metadata } from "next";
import { AccessToFinancePageContent } from "@/components/funding/AccessToFinancePageContent";

export const metadata: Metadata = {
  title: "Access to Finance — AfriGrow Hub",
  description:
    "Discover grants and funding programmes for African SMEs. Get funding-ready with AfriGrow Hub.",
};

export default function AccessToFinancePage() {
  return <AccessToFinancePageContent />;
}
