import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Target } from "lucide-react";
import type { DirectoryNudgeContent } from "@/lib/directory/profile-directory-nudge";

type ProfileDirectoryNudgeProps = {
  content: DirectoryNudgeContent;
  compact?: boolean;
  onCtaClick?: () => void;
};

const variantStyles: Record<
  DirectoryNudgeContent["variant"],
  { border: string; bg: string; icon: typeof BookOpen }
> = {
  below_threshold: {
    border: "border-border",
    bg: "bg-background",
    icon: Target,
  },
  almost_there: {
    border: "border-accent/30",
    bg: "bg-accent-light/50",
    icon: Target,
  },
  ready_save: {
    border: "border-primary/25",
    bg: "bg-primary-light/50",
    icon: Sparkles,
  },
  listed: {
    border: "border-primary/25",
    bg: "bg-primary-light/40",
    icon: BookOpen,
  },
  featured_push: {
    border: "border-primary/30",
    bg: "bg-primary-light/50",
    icon: Sparkles,
  },
};

export function ProfileDirectoryNudge({
  content,
  compact = false,
  onCtaClick,
}: ProfileDirectoryNudgeProps) {
  const styles = variantStyles[content.variant];
  const Icon = styles.icon;

  const ctaClass =
    "inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline";

  return (
    <div
      className={`rounded-2xl border ${styles.border} ${styles.bg} ${compact ? "p-4" : "p-5"}`}
    >
      <div className={`flex gap-3 ${compact ? "flex-col sm:flex-row sm:items-center sm:justify-between" : "flex-col sm:flex-row sm:items-start sm:justify-between"}`}>
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{content.title}</p>
            <p className={`mt-1 text-sm text-muted ${compact ? "" : "max-w-xl"}`}>
              {content.message}
            </p>
            {content.pointsToDirectory !== undefined && content.pointsToDirectory > 0 ? (
              <p className="mt-2 text-xs font-medium text-accent">
                {content.pointsToDirectory}% more to unlock directory listing
              </p>
            ) : null}
          </div>
        </div>

        {onCtaClick ? (
          <button type="button" onClick={onCtaClick} className={ctaClass}>
            {content.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <Link href={content.ctaHref} className={ctaClass}>
            {content.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
