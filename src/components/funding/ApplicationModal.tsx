"use client";

import { ExternalLink, X } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import {
  calculateReadiness,
  FUNDING_DISCLAIMER,
  type MatchedGrantOpportunity,
} from "@/lib/funding-data";

type ApplicationModalProps = {
  grant: MatchedGrantOpportunity | null;
  completedItems: Set<string>;
  onClose: () => void;
};

export function ApplicationModal({
  grant,
  completedItems,
  onClose,
}: ApplicationModalProps) {
  const { session } = useSession();

  if (!grant) return null;

  const readiness = calculateReadiness(completedItems);
  const ready = readiness >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div>
            <h2 className="font-semibold text-foreground">Prepare your application</h2>
            <p className="text-sm text-muted">{grant.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-primary-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-primary/15 bg-primary-light/40 p-4 text-sm text-foreground">
            {FUNDING_DISCLAIMER}
          </div>

          <div
            className={`rounded-xl p-4 ${
              ready ? "bg-primary-light" : "bg-accent-light"
            }`}
          >
            <p className={`text-sm font-semibold ${ready ? "text-primary" : "text-accent"}`}>
              {ready
                ? "You're ready to apply — strong funding readiness!"
                : `Funding readiness: ${readiness}% — complete more checklist items first.`}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">What you'll need</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              <li>• Business registration documents</li>
              <li>• Bank statements (6 months)</li>
              <li>• Business plan summary</li>
              <li>• Valid ID of director / owner</li>
              <li>• Completed AfriGrow profile</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Application preview
            </p>
            <p className="mt-2 text-sm text-foreground">
              <span className="font-medium">Programme:</span> {grant.name}
            </p>
            <p className="mt-1 text-sm text-foreground">
              <span className="font-medium">Amount:</span> {grant.amount}
            </p>
            <p className="mt-1 text-sm text-foreground">
              <span className="font-medium">Business:</span> {session.name}
            </p>
            <p className="mt-1 text-sm text-foreground">
              <span className="font-medium">Use of funds:</span> Programme delivery
              and operational support for {session.name}
            </p>
          </div>

          <a
            href={grant.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Apply on provider site
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-muted hover:bg-primary-light/30"
          >
            {ready ? "Back to checklist" : "Complete checklist first"}
          </button>

          <p className="text-center text-xs text-muted">
            AfriGrow prepares your documents and narrative — the provider reviews and decides
            on funding.
          </p>
        </div>
      </div>
    </div>
  );
}
