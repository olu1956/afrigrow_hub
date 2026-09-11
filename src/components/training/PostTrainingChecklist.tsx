"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { postTrainingSteps } from "@/lib/training/post-training-checklist";

const STORAGE_KEY = "afrigrow.afterTrainingSteps.v1";

function readDone(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function PostTrainingChecklist({
  loggedIn,
  footer,
}: {
  loggedIn: boolean;
  footer?: ReactNode;
}) {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(readDone());
  }, []);

  function toggleStep(id: string) {
    setDone((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <ol className="space-y-4">
      {postTrainingSteps.map((step, index) => {
        const complete = done.includes(step.id);
        return (
          <li
            key={step.id}
            className={`flex gap-4 rounded-2xl border bg-card p-5 shadow-sm ${
              complete ? "border-primary/30 bg-primary-light/20" : "border-border"
            }`}
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
            <button
              type="button"
              onClick={() => toggleStep(step.id)}
              aria-pressed={complete}
              aria-label={complete ? `Mark ${step.title} as not done` : `Mark ${step.title} complete`}
              className="mt-1 shrink-0 rounded-full p-1 text-primary transition hover:bg-primary-light"
            >
              <CheckCircle2
                className={`h-6 w-6 ${complete ? "fill-primary/15 text-primary" : "text-primary/30"}`}
              />
            </button>
          </li>
        );
      })}
      {footer ? <li className="list-none">{footer}</li> : null}
    </ol>
  );
}
