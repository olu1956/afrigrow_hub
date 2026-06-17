"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useSession } from "@/components/providers/SessionProvider";
import {
  buildCustomGrowthPlan,
  growthPlans,
  painPoints,
  priorityStyles,
  type GrowthPlan,
  type PainPointId,
} from "@/lib/growth-data";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function GrowthAgent() {
  const { session } = useSession();
  const [selected, setSelected] = useState<PainPointId | null>("visibility");
  const [customChallenge, setCustomChallenge] = useState("");
  const [activePlan, setActivePlan] = useState<GrowthPlan | null>(growthPlans.visibility);
  const [analyzing, setAnalyzing] = useState(false);
  const [planReady, setPlanReady] = useState(true);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const hasCustomChallenge = customChallenge.trim().length > 0;
  const plan = activePlan;

  const progress = useMemo(() => {
    if (!plan) return 0;
    const total = plan.actions.length;
    const done = plan.actions.filter((a) => completedActions.has(a.id)).length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [plan, completedActions]);

  async function analyze() {
    if (!selected && !customChallenge.trim()) return;
    setAnalyzing(true);
    setPlanReady(false);
    setCompletedActions(new Set());

    const challenge = customChallenge.trim();
    await new Promise((r) => setTimeout(r, 1300));

    if (challenge) {
      setActivePlan(buildCustomGrowthPlan(challenge, session.name));
    } else if (selected) {
      setActivePlan(growthPlans[selected]);
    }

    setPlanReady(true);
    setAnalyzing(false);
  }

  function toggleAction(id: string) {
    setCompletedActions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Growth & Pain Point Agent"
        description="Identify what's holding your business back and get a step-by-step action plan tailored to African SMEs."
        action={
          <button
            type="button"
            onClick={analyze}
            disabled={analyzing || (!selected && !customChallenge.trim())}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analyse my business
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Action plan progress</p>
            <p className="text-lg font-bold text-primary">{progress}%</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-primary-light">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-bold text-foreground">+18%</p>
            <p className="text-xs text-muted">Est. growth if plan completed</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">
              What&apos;s your biggest challenge?
            </h2>
            <div className="grid gap-2">
              {painPoints.map((point) => {
                const Icon = point.icon;
                const active = selected === point.id;
                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => {
                      setSelected(point.id);
                      setCustomChallenge("");
                      setActivePlan(growthPlans[point.id]);
                      setPlanReady(true);
                      setCompletedActions(new Set());
                    }}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-primary bg-primary-light"
                        : "border-border bg-background hover:border-primary/30"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active ? "bg-primary text-white" : "bg-primary-light text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <p
                        className={`text-sm font-semibold ${
                          active ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {point.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{point.description}</p>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-3 font-semibold text-foreground">
              Or describe your challenge
            </h2>
            <textarea
              rows={3}
              className={`${inputClass} resize-y ${
                hasCustomChallenge ? "border-accent ring-2 ring-accent/20" : ""
              }`}
              placeholder="E.g. Acquiring credit for business support…"
              value={customChallenge}
              onChange={(e) => {
                setCustomChallenge(e.target.value);
                if (e.target.value.trim()) setSelected(null);
              }}
            />
            <p className="mt-2 text-xs text-muted">
              {hasCustomChallenge
                ? "Your custom challenge will be analysed when you click Analyse my business."
                : "Optional — select a pain point above or describe your own, then analyse."}
            </p>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <section className="min-h-[400px] rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Your growth plan</h2>

            {analyzing && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 font-medium text-foreground">
                  Growth Agent is analysing…
                </p>
                <p className="mt-1 text-sm text-muted">
                  {hasCustomChallenge
                    ? `Analysing "${customChallenge.trim().slice(0, 80)}${customChallenge.trim().length > 80 ? "…" : ""}"`
                    : "Diagnosing pain points and building your action plan"}
                </p>
              </div>
            )}

            {!analyzing && planReady && plan && (
              <div className="space-y-5">
                {plan.challengeLabel && (
                  <div className="rounded-xl border border-accent/30 bg-accent-light/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                      Your challenge
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {plan.challengeLabel}
                    </p>
                  </div>
                )}
                <div className="rounded-xl bg-primary-light/60 p-4">
                  <p className="text-sm leading-relaxed text-foreground">{plan.summary}</p>
                  <p className="mt-2 text-xs font-semibold text-primary">
                    Expected impact: {plan.impact}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Recommended actions</p>
                  {plan.actions.map((action, index) => {
                    const done = completedActions.has(action.id);
                    return (
                      <article
                        key={action.id}
                        className={`rounded-xl border p-4 transition ${
                          done ? "border-primary/30 bg-primary-light/30" : "border-border bg-background"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleAction(action.id)}
                            className="mt-0.5 shrink-0 text-primary"
                            aria-label={done ? "Mark incomplete" : "Mark complete"}
                          >
                            {done ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted/50" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-muted">
                                Step {index + 1}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityStyles[action.priority]}`}
                              >
                                {action.priority}
                              </span>
                              <span className="text-xs text-muted">{action.timeframe}</span>
                            </div>
                            <h3
                              className={`mt-1 font-semibold ${
                                done ? "text-muted line-through" : "text-foreground"
                              }`}
                            >
                              {action.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted">{action.description}</p>
                            {action.agentLink && action.agentLabel && (
                              <Link
                                href={action.agentLink}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                              >
                                Open {action.agentLabel}
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {!analyzing && !planReady && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background py-20 text-center">
                <Sparkles className="h-10 w-10 text-primary/40" />
                <p className="mt-4 font-medium text-foreground">Select a challenge to begin</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Choose a pain point and click Analyse my business for a personalised plan.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
