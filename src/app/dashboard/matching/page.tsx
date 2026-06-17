import type { Metadata } from "next";
import { MatchingMarketplace } from "@/components/matching/MatchingMarketplace";

export const metadata: Metadata = {
  title: "Matching — AfriGrow Hub",
  description: "Find buyers, suppliers, and business partners across Africa.",
};

export default function MatchingPage() {
  return <MatchingMarketplace />;
}
