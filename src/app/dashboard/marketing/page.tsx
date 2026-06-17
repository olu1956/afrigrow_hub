import type { Metadata } from "next";
import { MarketingAgent } from "@/components/marketing/MarketingAgent";

export const metadata: Metadata = {
  title: "Marketing — AfriGrow Hub",
  description: "Create AI-powered marketing content for your African business.",
};

export default function MarketingPage() {
  return <MarketingAgent />;
}
