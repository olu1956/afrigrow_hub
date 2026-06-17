"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { FollowUp } from "@/lib/crm-data";
import { followUpTypeLabels } from "@/lib/crm-data";

type FollowUpTimelineProps = {
  followUps: FollowUp[];
  onToggle?: (id: string) => void;
};

export function FollowUpTimeline({ followUps, onToggle }: FollowUpTimelineProps) {
  if (followUps.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        No follow-up history yet. Log your first interaction above.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {followUps.map((item, index) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onToggle?.(item.id)}
              className="text-primary"
              aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5 text-muted/40" />
              )}
            </button>
            {index < followUps.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-border" />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-primary">
                {followUpTypeLabels[item.type]}
              </span>
              <span className="text-xs text-muted">{item.date}</span>
            </div>
            <p
              className={`mt-1 text-sm ${
                item.completed ? "text-muted line-through" : "text-foreground"
              }`}
            >
              {item.note}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
