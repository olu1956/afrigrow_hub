"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { useSession } from "@/components/providers/SessionProvider";
import {
  getLatestPainPointReportAction,
  savePainPointReportAction,
  updatePainPointReportProgressAction,
} from "@/lib/auth/growth-actions";
import {
  buildCustomGrowthPlan,
  growthPlans,
  painPoints,
  priorityStyles,
  type GrowthPlan,
  type PainPointId,
} from "@/lib/growth-data";
import { parseEstimatedGrowthPercent, resolveChallengeType } from "@/lib/growth/report-mapper";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function GrowthAgent() {
  const { session, hydrated, authEnabled } = useSession();
  const initialized = useRef(false);
  const [selected, setSelected] = useState<PainPointId | null>("visibility");
  const [customChallenge, setCustomChallenge] = useState("");
  const [activePlan, setActivePlan] = useState<GrowthPlan | null>(growthPlans.visibility);
  const [reportId, setReportId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingReport, setLoadingReport] = useState(authEnabled);
  const [planReady, setPlanReady] = useState(true);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const hasCustomChallenge = customChallenge.trim().length > 0;
  const plan = activePlan;

  const progress = useMemo(() => {
    if (!plan) return 0;
    const total = plan.actions.length;
    const done = plan.actions.filter((a) => completedActions.has(a.id)).length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [plan, completedActions]);

  const estimatedGrowth = parseEstimatedGrowthPercent(plan);

  useEffect(() => {
    if (!hydrated || initialized.current) return;

    async function init() {
      if (!authEnabled) {
        setLoadingReport(false);
        initialized.current = true;
        return;
      }

      setLoadingReport(true);
      setError(null);

      const result = await getLatestPainPointReportAction();
      if (result.warning) {
        setSetupWarning(result.warning);
      }

      if (!result.ok) {
        setError(result.error ?? "Could not load your growth report.");
        setLoadingReport(false);
        initialized.current = true;
        return;
      }

      if (result.report && result.plan) {
        setReportId(result.report.id);
        setActivePlan(result.plan);
        setPlanReady(true);
        setCompletedActions(new Set(result.completedActionIds ?? []));

        if (result.report.challenge_type === "custom") {
          setSelected(null);
          setCustomChallenge(result.plan.challengeLabel ?? "");
        } else {
          setSelected(result.report.challenge_type as PainPointId);
          setCustomChallenge("");
        }
      }

      setLoadingReport(false);
      initialized.current = true;
    }

    void init();
  }, [authEnabled, hydrated]);

  async function analyze() {
    if (!selected && !customChallenge.trim()) return;
    setAnalyzing(true);
    setPlanReady(false);
    setCompletedActions(new Set());
    setError(null);
    setSavedNotice(false);

    const challenge = customChallenge.trim();
    await new Promise((r) => setTimeout(r, 1300));

    const nextPlan = challenge
      ? buildCustomGrowthPlan(challenge, session.name)
      : selected
        ? growthPlans[selected]
        : null;

    if (!nextPlan) {
      setAnalyzing(false);
      return;
    }

    setActivePlan(nextPlan);
    setPlanReady(true);

    if (authEnabled) {
      const challengeType = resolveChallengeType(selected, customChallenge);
      const result = await savePainPointReportAction({
        challengeType,
        plan: nextPlan,
      });

      if (!result.ok) {
        setError(result.error ?? "Could not save your growth report.");
      } else if (result.report) {
        setReportId(result.report.id);
        setSavedNotice(true);
        window.setTimeout(() => setSavedNotice(false), 3000);
      }
    }

    setAnalyzing(false);
  }

  async function toggleAction(id: string) {
    const nextCompleted = new Set(completedActions);
    if (nextCompleted.has(id)) nextCompleted.delete(id);
    else nextCompleted.add(id);
    setCompletedActions(nextCompleted);

    if (!authEnabled || !reportId || !plan) return;

    const result = await updatePainPointReportProgressAction({
      reportId,
      plan,
      completedActionIds: [...nextCompleted],
    });

    if (!result.ok) {
      setError(result.error ?? "Could not update your progress.");
      setCompletedActions(completedActions);
    }
  }

  return (
    <DashboardPageLayout
      title="Growth & Pain Point Agent"
      description="Identify what's holding your business back and get a step-by-step action plan tailored to African SMEs."
      action={
        <button
          type="button"
          onClick={analyze}
          disabled={analyzing || loadingReport || (!selected && !customChallenge.trim())}
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
      heroExtra={
        setupWarning || error || savedNotice || loadingReport ? (
          <>
            {loadingReport ? (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
                Loading your saved growth report…
              </div>
            ) : null}
            {setupWarning ? (
              <div className="rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-sm text-foreground">
                <strong className="font-semibold">Database setup needed.</strong> {setupWarning}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {savedNotice ? (
              <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
                Growth report saved to your account.
              </div>
            ) : null}
          </>
        ) : undefined
      }
      heroFooter={
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={`${dashboardCardClass} sm:col-span-2`}>
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
          <div className={`flex items-center gap-4 ${dashboardCardClass}`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-foreground">+{estimatedGrowth}%</p>
              <p className="text-xs text-muted">Est. growth if plan completed</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <section className={dashboardCardClass}>
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

          <section className={dashboardCardClass}>
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
          <section className={`min-h-[400px] ${dashboardCardClass}`}>
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
    </DashboardPageLayout>
  );
}
