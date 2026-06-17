import type { Metadata } from "next";
import { GrowthAgent } from "@/components/growth/GrowthAgent";

export const metadata: Metadata = {
  title: "Growth — AfriGrow Hub",
  description: "Diagnose business pain points and get AI-powered growth recommendations.",
};

export default function GrowthPage() {
  return <GrowthAgent />;
}
