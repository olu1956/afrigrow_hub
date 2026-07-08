import type { Metadata } from "next";
import { TrainingPortal } from "@/components/training/TrainingPortal";

export const metadata: Metadata = {
  title: "Training — AfriGrow Hub",
  description:
    "Live courses and workshops for African SMEs — enroll in sessions or publish training as a provider.",
};

export default function TrainingPage() {
  return <TrainingPortal />;
}
