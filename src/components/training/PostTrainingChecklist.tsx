import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { postTrainingSteps } from "@/lib/training/post-training-checklist";

export function PostTrainingChecklist({
  loggedIn,
  footer,
}: {
  loggedIn: boolean;
  footer?: ReactNode;
}) {
  return (
    <ol className="space-y-4">
      {postTrainingSteps.map((step, index) => (
        <li
          key={step.id}
          className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
            <Link
              href={loggedIn ? step.href : `/login?redirect=${encodeURIComponent(step.href)}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {loggedIn ? step.cta : "Log in to start"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CheckCircle2 className="mt-1 hidden h-5 w-5 shrink-0 text-primary/30 sm:block" aria-hidden />
        </li>
      ))}
      {footer ? <li className="list-none">{footer}</li> : null}
    </ol>
  );
}
