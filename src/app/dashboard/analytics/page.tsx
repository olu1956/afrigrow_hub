import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics — AfriGrow Hub",
  description: "Track profile views, marketing reach, agent usage, and business growth.",
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
