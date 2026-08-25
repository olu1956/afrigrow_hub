"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CreditCard, Download, Loader2, Mail, Sparkles, Trash2 } from "lucide-react";
import { CreateInvoiceForm } from "@/components/billing/CreateInvoiceForm";
import { CreateQuotationForm } from "@/components/billing/CreateQuotationForm";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { useSession } from "@/components/providers/SessionProvider";
import { getInvoicesAction, sendInvoiceEmailAction, deleteInvoiceAction } from "@/lib/auth/billing-actions";
import {
  getQuotationsAction,
  sendQuotationEmailAction,
  deleteQuotationAction,
  deleteAllQuotationsAction,
} from "@/lib/auth/quotation-actions";
import {
  getSubscriptionAction,
  updateSubscriptionPlanAction,
} from "@/lib/auth/subscription-actions";
import { subscriptionStatusLabel } from "@/lib/billing/subscription-mapper";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";
import {
  getPlanById,
  planIdFromName,
  plans,
  type Invoice,
  type PlanId,
  type Quotation,
} from "@/lib/billing-data";
import { buildUsageForPlan } from "@/lib/billing/build-usage-limits";
import {
  getDashboardStatsAction,
  type DashboardStats,
} from "@/lib/auth/dashboard-stats-actions";
import {
  BILLING_PAGE_NOTE,
  NO_PAYMENT_METHOD_MESSAGE,
} from "@/lib/product-messaging";

type DisplayInvoice = Invoice & {
  recordId?: string;
  clientEmail?: string;
  source?: "live" | "demo";
};

type DisplayQuotation = Quotation & {
  recordId?: string;
  clientEmail?: string;
  source?: "live" | "demo";
};

const invoiceStatusStyles = {
  paid: "bg-primary-light text-primary",
  pending: "bg-accent-light text-accent",
  failed: "bg-red-50 text-red-700",
  draft: "bg-background text-muted border border-border",
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-background text-muted border border-border",
} as const;

const quotationStatusStyles = {
  draft: "bg-background text-muted border border-border",
  sent: "bg-accent-light text-accent",
  accepted: "bg-primary-light text-primary",
  declined: "bg-red-50 text-red-700",
  expired: "bg-background text-muted border border-border",
} as const;

export function BillingDashboard() {
  const { hydrated, authEnabled, setSession, session } = useSession();
  const { business } = useDashboardBusiness();
  const billingInitialized = useRef(false);

  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [subscriptionSetupWarning, setSubscriptionSetupWarning] = useState<string | null>(null);
  const [quotationSetupWarning, setQuotationSetupWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState(authEnabled);
  const [loadingQuotations, setLoadingQuotations] = useState(authEnabled);
  const [loadingSubscription, setLoadingSubscription] = useState(authEnabled);
  const [savingPlan, setSavingPlan] = useState(false);
  const [subscriptionPlanId, setSubscriptionPlanId] = useState<PlanId | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<DisplayInvoice[]>([]);
  const [quotations, setQuotations] = useState<DisplayQuotation[]>([]);
  const [usageStats, setUsageStats] = useState<DashboardStats | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAllQuotations, setDeletingAllQuotations] = useState(false);

  const currentPlanId = subscriptionPlanId ?? planIdFromName(business.plan);
  const currentPlan = getPlanById(currentPlanId);
  const usage = useMemo(
    () =>
      buildUsageForPlan(
        currentPlanId,
        usageStats ?? {
          profileStrength: null,
          crmContacts: 0,
          crmFollowUpsDue: 0,
          marketingCampaigns: 0,
          matchEnquiries: 0,
          fundingReadiness: null,
          invoicesCreated: 0,
          quotationsCreated: 0,
        },
      ),
    [currentPlanId, usageStats],
  );

  const loadSubscription = useCallback(async () => {
    if (!authEnabled) {
      setLoadingSubscription(false);
      return;
    }

    setLoadingSubscription(true);

    try {
      const result = await getSubscriptionAction();
      if (result.warning) {
        setSubscriptionSetupWarning(result.warning);
      }

      if (!result.ok) {
        setError(result.error ?? "Could not load subscription.");
        return;
      }

      if (result.subscription) {
        setSubscriptionPlanId(result.subscription.planId);
        setSubscriptionStatus(subscriptionStatusLabel(result.subscription.status));

        if (result.subscription.planName !== session.plan) {
          setSession({
            owner: session.owner,
            name: session.name,
            email: session.email,
            plan: result.subscription.planName,
            location: session.location,
            country: session.country,
            role: session.role,
            businessType: session.businessType,
          });
        }
      }
    } finally {
      setLoadingSubscription(false);
    }
  }, [authEnabled, session, setSession]);

  const loadInvoices = useCallback(async () => {
    if (!authEnabled) {
      setLoadingInvoices(false);
      return;
    }

    setLoadingInvoices(true);
    setError(null);

    const result = await getInvoicesAction();
    if (result.warning) {
      setSetupWarning(result.warning);
    }

    if (!result.ok) {
      setError(result.error ?? "Could not load invoices.");
      setLoadingInvoices(false);
      return;
    }

    setInvoices(result.invoices ?? []);
    setLoadingInvoices(false);
  }, [authEnabled]);

  const loadQuotations = useCallback(async () => {
    if (!authEnabled) {
      setLoadingQuotations(false);
      return;
    }

    setLoadingQuotations(true);

    const result = await getQuotationsAction();
    if (result.warning) {
      setQuotationSetupWarning(result.warning);
    }

    if (!result.ok) {
      setError(result.error ?? "Could not load quotations.");
      setLoadingQuotations(false);
      return;
    }

    setQuotations(result.quotations ?? []);
    setLoadingQuotations(false);
  }, [authEnabled]);

  const loadUsageStats = useCallback(async () => {
    if (!authEnabled) return;

    const result = await getDashboardStatsAction();
    if (result.ok && result.stats) {
      setUsageStats(result.stats);
    }
  }, [authEnabled]);

  useEffect(() => {
    if (!hydrated || billingInitialized.current) return;
    billingInitialized.current = true;
    void loadSubscription();
    void loadInvoices();
    void loadQuotations();
    void loadUsageStats();
  }, [hydrated, loadSubscription, loadInvoices, loadQuotations, loadUsageStats]);

  async function handlePlanChange(planId: PlanId) {
    if (planId === currentPlanId || savingPlan) return;

    if (!authEnabled || subscriptionSetupWarning) {
      const plan = getPlanById(planId);
      setSelectedPlan(planId);
      setSession({ ...business, plan: plan.name });
      setNotice(`Plan updated to ${plan.name}. ${BILLING_PAGE_NOTE}`);
      return;
    }

    setSavingPlan(true);
    setError(null);

    const result = await updateSubscriptionPlanAction({ planId });

    setSavingPlan(false);

    if (!result.ok || !result.subscription) {
      setError(result.error ?? "Could not update subscription.");
      return;
    }

    const plan = getPlanById(planId);
    setSubscriptionPlanId(result.subscription.planId);
    setSubscriptionStatus(subscriptionStatusLabel(result.subscription.status));
    setSelectedPlan(planId);
    setSession({
      owner: business.owner,
      name: business.name,
      email: business.email,
      plan: plan.name,
      location: business.location,
      country: business.country,
      role: business.role,
      businessType: business.businessType,
    });
    setNotice(`Plan updated to ${plan.name}. ${BILLING_PAGE_NOTE}`);
  }

  async function handleSendInvoice(invoice: DisplayInvoice) {
    if (!invoice.recordId || sendingId) return;
    setSendingId(invoice.recordId);
    setError(null);
    const result = await sendInvoiceEmailAction({ invoiceId: invoice.recordId });
    setSendingId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not email this invoice.");
      return;
    }
    setNotice(`Invoice emailed to ${invoice.clientEmail || "the client"}.`);
    void loadInvoices();
  }

  async function handleSendQuotation(quotation: DisplayQuotation) {
    if (!quotation.recordId || sendingId) return;
    setSendingId(quotation.recordId);
    setError(null);
    const result = await sendQuotationEmailAction({ quotationId: quotation.recordId });
    setSendingId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not email this quotation.");
      return;
    }
    setNotice(`Quotation emailed to ${quotation.clientEmail || "the client"}.`);
    void loadQuotations();
  }

  async function handleDeleteInvoice(invoice: DisplayInvoice) {
    if (!invoice.recordId || deletingId) return;
    if (!window.confirm(`Delete invoice ${invoice.id}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(invoice.recordId);
    setError(null);
    const result = await deleteInvoiceAction({ invoiceId: invoice.recordId });
    setDeletingId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not delete this invoice.");
      return;
    }
    setNotice(`Invoice ${invoice.id} deleted.`);
    void loadInvoices();
    void loadUsageStats();
  }

  async function handleDeleteQuotation(quotation: DisplayQuotation) {
    if (!quotation.recordId || deletingId || deletingAllQuotations) return;
    if (!window.confirm(`Delete quotation ${quotation.id}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(quotation.recordId);
    setError(null);
    const result = await deleteQuotationAction({ quotationId: quotation.recordId });
    setDeletingId(null);
    if (!result.ok) {
      setError(result.error ?? "Could not delete this quotation.");
      return;
    }
    setNotice(`Quotation ${quotation.id} deleted.`);
    void loadQuotations();
    void loadUsageStats();
  }

  async function handleDeleteAllQuotations() {
    const liveCount = quotations.filter((quotation) => quotation.source === "live").length;
    if (liveCount === 0 || deletingAllQuotations || deletingId) return;
    if (
      !window.confirm(
        `Delete all ${liveCount} quotation${liveCount === 1 ? "" : "s"}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingAllQuotations(true);
    setError(null);
    const result = await deleteAllQuotationsAction();
    setDeletingAllQuotations(false);
    if (!result.ok) {
      setError(result.error ?? "Could not delete quotations.");
      return;
    }
    setNotice("All quotations deleted.");
    void loadQuotations();
    void loadUsageStats();
  }

  return (
    <DashboardPageLayout
      title="Billing"
      description="Manage your subscription, create client invoices, and track plan usage."
      heroExtra={
        <div className="space-y-3">
          <div className="rounded-xl border border-primary/15 bg-primary-light/40 px-4 py-3 text-sm text-foreground">
            {BILLING_PAGE_NOTE}
          </div>
          {notice ? (
            <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
              {notice}
            </div>
          ) : null}
          {subscriptionSetupWarning ? (
            <div className="rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-sm text-foreground">
              <strong className="font-semibold">Subscriptions setup needed.</strong>{" "}
              {subscriptionSetupWarning}
            </div>
          ) : null}
          {setupWarning ? (
            <div className="rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-sm text-foreground">
              <strong className="font-semibold">Invoices setup needed.</strong> {setupWarning}
            </div>
          ) : null}
          {quotationSetupWarning ? (
            <div className="rounded-xl border border-accent/30 bg-accent-light/40 px-4 py-3 text-sm text-foreground">
              <strong className="font-semibold">Quotations setup needed.</strong>{" "}
              {quotationSetupWarning}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-dark to-primary p-6 text-white lg:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-white/80">Current plan</span>
            {subscriptionStatus ? (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                {subscriptionStatus}
              </span>
            ) : null}
          </div>
          {loadingSubscription && subscriptionPlanId === null ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subscription…
            </div>
          ) : (
            <>
          <h2 className="mt-3 text-2xl font-bold">{currentPlan.name}</h2>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{currentPlan.price}</span>
            <span className="text-sm text-white/70">{currentPlan.period}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/85">{currentPlan.description}</p>
          <p className="mt-4 text-xs text-white/70">
            Card billing not active — no charges until payments go live.
          </p>
            </>
          )}
        </section>

        <section className={`${dashboardCardClass} lg:col-span-3`}>
          <h2 className="font-semibold text-foreground">Usage this period</h2>
          <p className="mt-1 text-xs text-muted">Counts from your live account activity.</p>
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
                {plan.id === "enterprise" ? (
                  <Link
                    href="/contact?plan=enterprise&source=billing"
                    className={`mt-6 block rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                      plan.highlighted
                        ? "bg-white text-primary hover:bg-white/90"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    Contact sales
                  </Link>
                ) : (
                <button
                  type="button"
                  disabled={isCurrent || savingPlan || loadingSubscription}
                  onClick={() => void handlePlanChange(plan.id)}
                  className={`mt-6 rounded-xl py-2.5 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60 ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-white/90 disabled:bg-white/80"
                      : "bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60"
                  } ${isSelected ? "ring-2 ring-accent ring-offset-2" : ""}`}
                >
                  {savingPlan && isSelected
                    ? "Saving…"
                    : isCurrent
                    ? "Current plan"
                    : `Switch to ${plan.name}`}
                </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <CreateInvoiceForm
          disabled={!authEnabled || Boolean(setupWarning)}
          onSuccess={(message) => {
            setNotice(message);
            setError(null);
            void loadInvoices();
            void loadUsageStats();
          }}
          onError={(message) => setError(message)}
        />

        <CreateQuotationForm
          disabled={!authEnabled || Boolean(quotationSetupWarning)}
          onSuccess={(message) => {
            setNotice(message);
            setError(null);
            void loadQuotations();
            void loadUsageStats();
          }}
          onError={(message) => setError(message)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className={`${dashboardCardClass} lg:col-span-2`}>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Payment method</h2>
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-4">
            <p className="font-medium text-foreground">No card on file</p>
            <p className="mt-1 text-sm text-muted">{NO_PAYMENT_METHOD_MESSAGE}</p>
          </div>
          <p className="mt-4 text-xs text-muted">
            You can switch plans above without entering payment details.
          </p>
        </section>

        <section className={`${dashboardCardClass} lg:col-span-3`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-foreground">Invoice history</h2>
            {invoices.some((invoice) => invoice.source === "live") ? (
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                Live data
              </span>
            ) : null}
          </div>
          <div className="mt-4 overflow-x-auto">
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background px-4 py-10 text-center">
                <p className="font-medium text-foreground">No invoices yet</p>
                <p className="mt-1 text-sm text-muted">
                  Create your first client invoice using the form above.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="pb-3 pr-4 font-medium">Invoice</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 font-medium"> </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.recordId ?? invoice.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{invoice.id}</td>
                      <td className="py-3 pr-4 text-muted">{invoice.date}</td>
                      <td className="py-3 pr-4 text-foreground">{invoice.description}</td>
                      <td className="py-3 pr-4 font-medium text-foreground">{invoice.amount}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${invoiceStatusStyles[invoice.status]}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {invoice.recordId && invoice.source === "live" ? (
                          <button
                            type="button"
                            onClick={() => void handleSendInvoice(invoice)}
                            disabled={sendingId === invoice.recordId || deletingId === invoice.recordId}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                          >
                            {sendingId === invoice.recordId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Mail className="h-3.5 w-3.5" />
                            )}
                            Email client
                          </button>
                        ) : null}
                      </td>
                      <td className="py-3">
                        {invoice.recordId && invoice.source === "live" ? (
                          <button
                            type="button"
                            onClick={() => void handleDeleteInvoice(invoice)}
                            disabled={deletingId === invoice.recordId || sendingId === invoice.recordId}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline disabled:opacity-60"
                          >
                            {deletingId === invoice.recordId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {invoices.length > 0 ? (
          <button
            type="button"
            onClick={() => setNotice("Invoice downloads will be available when billing goes live.")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Download className="h-4 w-4" />
            Download all invoices
          </button>
          ) : null}
        </section>
      </div>

      <section className={dashboardCardClass}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">Quotation history</h2>
          <div className="flex items-center gap-3">
            {quotations.some((quotation) => quotation.source === "live") ? (
              <button
                type="button"
                onClick={() => void handleDeleteAllQuotations()}
                disabled={deletingAllQuotations || Boolean(deletingId)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline disabled:opacity-60"
              >
                {deletingAllQuotations ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete all
              </button>
            ) : null}
            {quotations.some((quotation) => quotation.source === "live") ? (
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                Live data
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          {loadingQuotations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : quotations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background px-4 py-10 text-center">
              <p className="font-medium text-foreground">No quotations yet</p>
              <p className="mt-1 text-sm text-muted">
                Create your first quotation using the form above.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="pb-3 pr-4 font-medium">Quotation</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Client</th>
                  <th className="pb-3 pr-4 font-medium">Description</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation) => (
                  <tr
                    key={quotation.recordId ?? quotation.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">{quotation.id}</td>
                    <td className="py-3 pr-4 text-muted">{quotation.date}</td>
                    <td className="py-3 pr-4 text-foreground">{quotation.clientName}</td>
                    <td className="py-3 pr-4 text-foreground">{quotation.description}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">{quotation.amount}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${quotationStatusStyles[quotation.status]}`}
                      >
                        {quotation.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {quotation.recordId && quotation.source === "live" ? (
                        <button
                          type="button"
                          onClick={() => void handleSendQuotation(quotation)}
                          disabled={
                            sendingId === quotation.recordId ||
                            deletingId === quotation.recordId ||
                            deletingAllQuotations
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                        >
                          {sendingId === quotation.recordId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Mail className="h-3.5 w-3.5" />
                          )}
                          Email client
                        </button>
                      ) : null}
                    </td>
                    <td className="py-3">
                      {quotation.recordId && quotation.source === "live" ? (
                        <button
                          type="button"
                          onClick={() => void handleDeleteQuotation(quotation)}
                          disabled={
                            deletingId === quotation.recordId ||
                            sendingId === quotation.recordId ||
                            deletingAllQuotations
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline disabled:opacity-60"
                        >
                          {deletingId === quotation.recordId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </DashboardPageLayout>
  );
}
