import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { NextStepsEmailButton } from "@/components/training/NextStepsEmailButton";
import { PostTrainingChecklist } from "@/components/training/PostTrainingChecklist";

export const metadata: Metadata = {
  title: "After training — next steps",
  description: "Complete these five actions after AfriGrow Hub training.",
};

export default function NextStepsPage() {
  return (
    <DashboardPageLayout
      title="After training"
      description="Five actions so tonight’s session becomes real progress this week."
      action={<NextStepsEmailButton />}
    >
      <PostTrainingChecklist loggedIn />
      <p className="text-sm text-muted">
        Share the public version in Zoom chat:{" "}
        <Link href="/after-training" className="font-semibold text-primary hover:underline">
          afrigrow.app/after-training
        </Link>
      </p>
    </DashboardPageLayout>
  );
}
