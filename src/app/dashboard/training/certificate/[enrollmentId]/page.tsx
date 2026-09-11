import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrainingCertificatePrint } from "@/components/training/TrainingCertificatePrint";
import { getTrainingCertificateAction } from "@/lib/auth/training-lms-actions";

type CertificatePageProps = {
  params: Promise<{ enrollmentId: string }>;
};

export const metadata: Metadata = {
  title: "Training certificate — AfriGrow Hub",
};

export const dynamic = "force-dynamic";

export default async function TrainingCertificatePage({ params }: CertificatePageProps) {
  const { enrollmentId } = await params;
  const result = await getTrainingCertificateAction(enrollmentId);

  if (!result.ok || !result.certificate) {
    if (result.error?.includes("signed in")) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground">Sign in to view your certificate</h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
          >
            Sign in
          </Link>
        </div>
      );
    }
    if (result.error?.includes("not found") || result.error?.includes("own certificate")) {
      notFound();
    }
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Certificate not ready yet</h1>
        <p className="mt-3 text-sm text-muted">
          {result.error ??
            "Complete every module and have the provider record live attendance first."}
        </p>
        <Link
          href="/dashboard/training"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
        >
          Back to Training
        </Link>
      </div>
    );
  }

  return <TrainingCertificatePrint certificate={result.certificate} />;
}
