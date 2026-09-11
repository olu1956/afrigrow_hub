"use client";

import Image from "next/image";
import Link from "next/link";
import { Printer } from "lucide-react";
import { BRAND_LOGO_ALT, BRAND_LOGO_PATH } from "@/lib/brand-logo";
import type { TrainingCertificateView } from "@/lib/training-data";

function formatCertificateDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function TrainingCertificatePrint({
  certificate,
}: {
  certificate: TrainingCertificateView;
}) {
  return (
    <div className="min-h-dvh bg-[#f4f1eb] px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="afrigrow-print-hide mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/training"
          className="rounded-md border border-border bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted"
        >
          Back to Training
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / Save PDF
        </button>
      </div>

      <article className="mx-auto max-w-3xl border-[12px] border-primary-dark bg-white px-8 py-12 text-center shadow-lg print:max-w-none print:border-8 print:shadow-none sm:px-14 sm:py-16">
        <Image
          src={BRAND_LOGO_PATH}
          alt={BRAND_LOGO_ALT}
          width={160}
          height={160}
          className="mx-auto h-20 w-auto object-contain"
        />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Certificate of completion
        </p>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          AfriGrow Hub
        </h1>
        <p className="mt-8 text-sm text-muted">This is to certify that</p>
        <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {certificate.traineeName}
        </p>
        <p className="mt-6 text-sm text-muted">has completed</p>
        <p className="mt-2 text-xl font-semibold text-primary-dark sm:text-2xl">
          {certificate.courseTitle}
        </p>
        {certificate.sessionTitle ? (
          <p className="mt-2 text-sm text-muted">{certificate.sessionTitle}</p>
        ) : null}
        <p className="mt-8 text-sm text-foreground">
          {formatCertificateDate(certificate.completedAt)}
        </p>
        <p className="mt-10 text-xs uppercase tracking-wide text-muted">
          {certificate.providerName} · AfriGrow Hub
        </p>
      </article>
    </div>
  );
}
