import type { Metadata } from "next";
import { TrainingPortal } from "@/components/training/TrainingPortal";

export const metadata: Metadata = {
  title: "Training — AfriGrow Hub",
  description:
    "Short programmes for African SMEs — live Zoom sessions, modules, attendance, and a simple certificate.",
};

export default function TrainingPage() {
  return <TrainingPortal />;
}
