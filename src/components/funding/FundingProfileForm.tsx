"use client";

import { FormEvent, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  dashboardCardClass,
  marketingFieldBorderClass,
} from "@/components/dashboard/DashboardPageCanvas";
import { businessStageOptions, type BusinessStage } from "@/lib/funding-data";

const inputClass = `w-full rounded-xl ${marketingFieldBorderClass} bg-white px-4 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-foreground/45 hover:border-[#9fb0a8] focus:border-primary focus:ring-2 focus:ring-primary/20`;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

type FundingProfileFormProps = {
  businessStage: BusinessStage;
  annualRevenue: string;
  fundingNeeded: string;
  fundingPurpose: string;
  recommendations: string[];
  currencySymbol: string;
  currencyHint: string;
  countryLabel?: string;
  disabled?: boolean;
  saving?: boolean;
  onBusinessStageChange: (value: BusinessStage) => void;
  onAnnualRevenueChange: (value: string) => void;
  onFundingNeededChange: (value: string) => void;
  onFundingPurposeChange: (value: string) => void;
  onSubmit: () => Promise<void>;
};

export function FundingProfileForm({
  businessStage,
  annualRevenue,
  fundingNeeded,
  fundingPurpose,
  recommendations,
  currencySymbol,
  currencyHint,
  countryLabel,
  disabled = false,
  saving = false,
  onBusinessStageChange,
  onAnnualRevenueChange,
  onFundingNeededChange,
  onFundingPurposeChange,
  onSubmit,
}: FundingProfileFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!fundingPurpose.trim()) {
      setFormError("Describe what you need funding for.");
      return;
    }

    await onSubmit();
  }

  return (
    <section className={`${dashboardCardClass} mb-6`}>
      <div className="mb-5">
        <h2 className="font-semibold text-foreground">Your funding profile</h2>
        <p className="mt-1 text-sm text-muted">
          Tell us about your business stage and funding needs to improve matches.
        </p>
        <p className="mt-2 text-xs text-muted">{currencyHint}</p>
        <p className="mt-2 text-xs text-muted">
          AfriGrow prepares you for applications — each programme provider makes the final funding
          decision.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Business stage">
          <select
            value={businessStage}
            onChange={(e) => onBusinessStageChange(e.target.value as BusinessStage)}
            className={inputClass}
            disabled={disabled || saving}
          >
            {businessStageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Annual revenue (${currencySymbol})`}>
            <input
              type="number"
              min="0"
              step="1000"
              value={annualRevenue}
              onChange={(e) => onAnnualRevenueChange(e.target.value)}
              placeholder={
                countryLabel ? `e.g. revenue in ${countryLabel}` : "e.g. 2500000"
              }
              className={inputClass}
              disabled={disabled || saving}
            />
          </Field>
          <Field label={`Funding needed (${currencySymbol})`}>
            <input
              type="number"
              min="0"
              step="1000"
              value={fundingNeeded}
              onChange={(e) => onFundingNeededChange(e.target.value)}
              placeholder={
                countryLabel ? `e.g. target in ${countryLabel}` : "e.g. 5000000"
              }
              className={inputClass}
              disabled={disabled || saving}
            />
          </Field>
        </div>

        <Field label="Funding purpose">
          <textarea
            rows={3}
            value={fundingPurpose}
            onChange={(e) => onFundingPurposeChange(e.target.value)}
            placeholder="E.g. Purchase equipment, expand inventory, hire staff…"
            className={`${inputClass} resize-y`}
            disabled={disabled || saving}
          />
        </Field>

        {formError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabled || saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Save funding profile
        </button>
      </form>

      {recommendations.length > 0 ? (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary-light/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Recommendations
          </p>
          <ul className="mt-3 space-y-2">
            {recommendations.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
