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
      <p className="rounded-2xl border border-primary/15 bg-primary-light/30 px-4 py-3 text-sm text-muted">
        This list is what to do after the live session. To finish a course and print a certificate,
        go to{" "}
        <Link href="/dashboard/training?tab=my-learning" className="font-semibold text-primary hover:underline">
          Training → My courses
        </Link>{" "}
        and click <span className="font-semibold text-foreground">Mark complete</span>. Tick a step
        here when you have done it.
      </p>
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
