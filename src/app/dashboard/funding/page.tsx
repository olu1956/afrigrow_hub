import type { Metadata } from "next";
import { FundingAgent } from "@/components/funding/FundingAgent";

export const metadata: Metadata = {
  title: "Funding — AfriGrow Hub",
  description: "Discover grants and funding opportunities and get funding-ready.",
};

export default function FundingPage() {
  return <FundingAgent />;
}
