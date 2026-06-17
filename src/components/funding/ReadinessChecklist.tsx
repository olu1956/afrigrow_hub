"use client";

import { CheckCircle2, Circle } from "lucide-react";
import {
  categoryLabels,
  readinessItems,
  type ReadinessItem,
} from "@/lib/funding-data";

type ReadinessChecklistProps = {
  completed: Set<string>;
  onToggle: (id: string) => void;
  readiness: number;
};

export function ReadinessChecklist({
  completed,
  onToggle,
  readiness,
}: ReadinessChecklistProps) {
  const grouped = readinessItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ReadinessItem[]>,
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Funding readiness</h2>
        <span className="text-2xl font-bold text-primary">{readiness}%</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-primary-light">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${readiness}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        Complete required items to unlock more grant matches.
      </p>

      <div className="mt-5 space-y-5">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </p>
            <ul className="space-y-2">
              {items.map((item) => {
                const done = completed.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onToggle(item.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                        done
                          ? "border-primary/30 bg-primary-light/30"
                          : "border-border bg-background hover:border-primary/20"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted/40" />
                      )}
                      <span>
                        <span
                          className={`text-sm font-medium ${
                            done ? "text-muted line-through" : "text-foreground"
                          }`}
                        >
                          {item.label}
                          {item.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
