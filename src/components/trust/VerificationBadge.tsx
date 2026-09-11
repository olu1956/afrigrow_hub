import { ShieldCheck } from "lucide-react";

type VerificationBadgeProps = {
  verified: boolean;
  className?: string;
};

export function VerificationBadge({ verified, className = "" }: VerificationBadgeProps) {
  if (verified) {
    return (
      <span
        aria-label="Verified business"
        className={`inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary ${className}`}
      >
        <ShieldCheck className="h-3 w-3" />
        Verified
      </span>
    );
  }

  return (
      <span
        aria-label="Unverified business"
        className={`inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold uppercase text-muted ring-1 ring-border ${className}`}
      >
      Unverified
    </span>
  );
}
