"use client";

import { useMemo, useState } from "react";
import { Check, CreditCard, Download, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useSession } from "@/components/providers/SessionProvider";
import { mockBusiness } from "@/lib/dashboard-nav";
import {
  getPlanById,
  getUsageForPlan,
  invoices,
  nextBillingDate,
  planIdFromName,
  plans,
  type PlanId,
} from "@/lib/billing-data";

const statusStyles = {
  paid: "bg-primary-light text-primary",
  pending: "bg-accent-light text-accent",
  failed: "bg-red-50 text-red-700",
} as const;

export function BillingDashboard() {
  const { session, hydrated, setSession } = useSession();
  const business = hydrated ? session : mockBusiness;
  const currentPlanId = planIdFromName(business.plan);
  const currentPlan = getPlanById(currentPlanId);
  const usage = getUsageForPlan(currentPlanId);

  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const renewalLabel = useMemo(() => nextBillingDate(), []);

  function handlePlanChange(planId: PlanId) {
    if (planId === currentPlanId) return;
    const plan = getPlanById(planId);
    setSelectedPlan(planId);
    setSession({ ...business, plan: plan.name });
    setNotice(`Plan updated to ${plan.name} (preview only — no payment processed).`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription, view invoices, and track plan usage."
      />

      {notice && (
        <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-dark to-primary p-6 text-white lg:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-white/80">Current plan</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold">{currentPlan.name}</h2>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{currentPlan.price}</span>
            <span className="text-sm text-white/70">{currentPlan.period}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/85">{currentPlan.description}</p>
          {currentPlanId !== "starter" && currentPlanId !== "enterprise" && (
            <p className="mt-4 text-xs text-white/70">Next billing date: {renewalLabel}</p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          <h2 className="font-semibold text-foreground">Usage this period</h2>
          <ul className="mt-5 space-y-4">
            {usage.map((item) => {
              const percent =
                item.limit !== null ? Math.min(100, Math.round((item.used / item.limit) * 100)) : 0;
              const atLimit = item.limit !== null && item.used >= item.limit;
              return (
                <li key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className={atLimit ? "font-semibold text-accent" : "text-muted"}>
                      {item.used.toLocaleString()}
                      {item.limit !== null ? ` / ${item.limit}` : " · unlimited"}
                    </span>
                  </div>
                  {item.limit !== null && (
                    <div className="h-2 overflow-hidden rounded-full bg-primary-light">
                      <div
                        className={`h-full rounded-full ${atLimit ? "bg-accent" : "bg-primary"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Available plans</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isSelected = selectedPlan === plan.id && !isCurrent;
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-6 ${
                  plan.highlighted
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/15"
                    : "border-border bg-card"
                } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-lg font-semibold ${plan.highlighted ? "text-white" : "text-foreground"}`}
                  >
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        plan.highlighted ? "bg-white/20 text-white" : "bg-primary-light text-primary"
                      }`}
                    >
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-muted"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/80" : "text-muted"}`}>
                  {plan.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-accent" : "text-primary"}`}
                      />
                      <span className={plan.highlighted ? "text-white/90" : "text-foreground"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handlePlanChange(plan.id)}
                  className={`mt-6 rounded-xl py-2.5 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60 ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-white/90 disabled:bg-white/80"
                      : "bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60"
                  } ${isSelected ? "ring-2 ring-accent ring-offset-2" : ""}`}
                >
                  {isCurrent
                    ? "Current plan"
                    : plan.id === "enterprise"
                      ? "Contact sales"
                      : `Switch to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Payment method</h2>
          </div>
          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <p className="font-medium text-foreground">Visa ending in 4242</p>
            <p className="mt-1 text-sm text-muted">Expires 08/2028</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setNotice("Payment method updates will be available when billing goes live.")
            }
            className="mt-4 text-sm font-semibold text-primary hover:underline"
          >
            Update payment method
          </button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          <h2 className="font-semibold text-foreground">Invoice history</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="pb-3 pr-4 font-medium">Invoice</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Description</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">{invoice.id}</td>
                    <td className="py-3 pr-4 text-muted">{invoice.date}</td>
                    <td className="py-3 pr-4 text-foreground">{invoice.description}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">{invoice.amount}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[invoice.status]}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => setNotice("Invoice downloads will be available in a later phase.")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Download className="h-4 w-4" />
            Download all invoices
          </button>
        </section>
      </div>
    </div>
  );
}
