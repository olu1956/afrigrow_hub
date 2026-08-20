"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Upload, Wallet } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import {
  deleteFundingOpportunityAction,
  getAdminFundingOpportunitiesAction,
  importFundingOpportunitiesCsvAction,
  seedFundingOpportunitiesAction,
  updateFundingOpportunityStatusAction,
  upsertFundingOpportunityAction,
} from "@/lib/auth/funding-catalogue-actions";
import type { FundingOpportunityRow } from "@/lib/database/funding-opportunities";
import { FUNDING_CSV_TEMPLATE } from "@/lib/funding/csv-import";
import { typeLabels, type FundingType } from "@/lib/funding-data";

const emptyForm = {
  id: "",
  name: "",
  provider: "",
  type: "grant" as FundingType,
  amount: "",
  region: "",
  deadline: "",
  eligibility: "",
  description: "",
  apply_url: "",
  sectors: "",
  country_keys: "",
  eligible_stages: "early|growth",
  sector_keys: "",
  funding_min: "",
  funding_max: "",
  funding_currency: "",
  status: "published" as "draft" | "published",
};

function splitField(value: string): string[] {
  return value
    .split(/[|;,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function FundingCatalogueAdmin() {
  const [rows, setRows] = useState<FundingOpportunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [csvText, setCsvText] = useState(FUNDING_CSV_TEMPLATE);
  const [countryFilter, setCountryFilter] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    const result = await getAdminFundingOpportunitiesAction();
    if (!result.ok) {
      setError(result.error ?? "Could not load funding catalogue.");
      setRows([]);
    } else {
      setRows(result.rows ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function editRow(row: FundingOpportunityRow) {
    setForm({
      id: row.id,
      name: row.name,
      provider: row.provider,
      type: (row.type as FundingType) || "grant",
      amount: row.amount,
      region: row.region,
      deadline: row.deadline,
      eligibility: row.eligibility,
      description: row.description,
      apply_url: row.apply_url,
      sectors: (row.sectors ?? []).join("|"),
      country_keys: (row.country_keys ?? []).join("|"),
      eligible_stages: (row.eligible_stages ?? []).join("|"),
      sector_keys: (row.sector_keys ?? []).join("|"),
      funding_min: row.funding_min != null ? String(row.funding_min) : "",
      funding_max: row.funding_max != null ? String(row.funding_max) : "",
      funding_currency: row.funding_currency,
      status: row.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    const result = await upsertFundingOpportunityAction({
      id: form.id.trim(),
      name: form.name.trim(),
      provider: form.provider.trim(),
      type: form.type,
      amount: form.amount.trim(),
      region: form.region.trim(),
      deadline: form.deadline.trim(),
      eligibility: form.eligibility.trim(),
      description: form.description.trim(),
      apply_url: form.apply_url.trim(),
      sectors: splitField(form.sectors),
      country_keys: splitField(form.country_keys).map((k) => k.toLowerCase()),
      eligible_stages: splitField(form.eligible_stages),
      sector_keys: splitField(form.sector_keys).map((k) => k.toLowerCase()),
      funding_min: form.funding_min ? Number(form.funding_min) : null,
      funding_max: form.funding_max ? Number(form.funding_max) : null,
      funding_currency: form.funding_currency.trim().toUpperCase(),
      status: form.status,
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save programme.");
      return;
    }

    setNotice("Programme saved. Members will see published items on Finance Agent.");
    setForm(emptyForm);
    await load();
  }

  async function handleCsvImport() {
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await importFundingOpportunitiesCsvAction(csvText);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "CSV import failed.");
      return;
    }
    setNotice(
      `Imported ${result.imported ?? 0} programme(s).${result.warning ? ` ${result.warning}` : ""}`,
    );
    await load();
  }

  async function handleSeed() {
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await seedFundingOpportunitiesAction();
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not seed catalogue.");
      return;
    }
    setNotice(`Seeded ${result.imported ?? 0} built-in programmes as published.`);
    await load();
  }

  async function handleStatus(id: string, status: "draft" | "published") {
    setSaving(true);
    setError(null);
    const result = await updateFundingOpportunityStatusAction({ id, status });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not update status.");
      return;
    }
    setNotice(`Marked ${id} as ${status}.`);
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`Delete programme ${id}?`)) return;
    setSaving(true);
    setError(null);
    const result = await deleteFundingOpportunityAction(id);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not delete.");
      return;
    }
    setNotice(`Deleted ${id}.`);
    await load();
  }

  const filteredRows = countryFilter.trim()
    ? rows.filter((row) =>
        (row.country_keys ?? []).some((key) =>
          key.toLowerCase().includes(countryFilter.trim().toLowerCase()),
        ),
      )
    : rows;

  return (
    <DashboardPageLayout
      title="Funding catalogue"
      description="Upload and publish funding sources by country. Members see published programmes in Finance Agent."
      heroExtra={
        notice || error ? (
          <>
            {notice ? (
              <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
                {notice}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </>
        ) : null
      }
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSeed()}
          className="rounded-md border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wide text-foreground disabled:opacity-50"
        >
          Seed built-in list
        </button>
        <button
          type="button"
          onClick={() => {
            setForm(emptyForm);
            setNotice(null);
          }}
          className="rounded-md border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted"
        >
          Clear form
        </button>
      </div>

      <form onSubmit={handleSave} className={`${dashboardCardClass} grid gap-4 p-6 lg:grid-cols-2`}>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground">Add / edit programme</h2>
          <p className="mt-1 text-sm text-muted">
            Country keys example: <code>nigeria</code>, <code>uk</code>, <code>ghana</code>,{" "}
            <code>west-africa</code>, <code>africa</code> (use | between multiple).
          </p>
        </div>

        {(
          [
            ["id", "ID (unique slug)", "g-nigeria-example"],
            ["name", "Name", "Programme name"],
            ["provider", "Provider", "Organisation"],
            ["amount", "Amount label", "₦5M or $10,000"],
            ["region", "Region label", "Nigeria"],
            ["deadline", "Deadline", "Dec 2026"],
            ["apply_url", "Apply URL", "https://..."],
            ["funding_currency", "Currency code", "NGN"],
            ["funding_min", "Min amount (number)", "0"],
            ["funding_max", "Max amount (number)", "5000000"],
            ["country_keys", "Country keys *", "nigeria|west-africa"],
            ["sectors", "Sectors", "Retail|Services"],
            ["eligible_stages", "Eligible stages", "early|growth"],
            ["sector_keys", "Sector keys", "retail|services"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <label key={key} className="block text-sm">
            <span className="font-medium text-foreground">{label}</span>
            <input
              required={key === "id" || key === "name" || key === "country_keys"}
              value={form[key]}
              placeholder={placeholder}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>
        ))}

        <label className="block text-sm">
          <span className="font-medium text-foreground">Type</span>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, type: e.target.value as FundingType }))
            }
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Status</span>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as "draft" | "published",
              }))
            }
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>

        <label className="block text-sm lg:col-span-2">
          <span className="font-medium text-foreground">Eligibility</span>
          <input
            value={form.eligibility}
            onChange={(e) => setForm((prev) => ({ ...prev, eligibility: e.target.value }))}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm lg:col-span-2">
          <span className="font-medium text-foreground">Description</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            Save programme
          </button>
        </div>
      </form>

      <div className={`${dashboardCardClass} space-y-4 p-6`}>
        <div>
          <h2 className="text-lg font-bold text-foreground">CSV upload</h2>
          <p className="mt-1 text-sm text-muted">
            Paste CSV with a <code>countryKeys</code> column. Upserts by <code>id</code>. Use this to
            refresh a country’s programmes in bulk.
          </p>
        </div>
        <textarea
          rows={8}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleCsvImport()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Import CSV
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">
            Catalogue ({filteredRows.length}
            {countryFilter ? ` filtered` : ""})
          </h2>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Filter by country key</span>
            <input
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              placeholder="nigeria"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm sm:w-56"
            />
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-12 text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredRows.length === 0 ? (
          <p className="text-sm text-muted">No programmes yet. Seed the built-in list or import CSV.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-primary-dark text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Programme</th>
                  <th className="px-4 py-3 font-semibold">Countries</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.name}</p>
                      <p className="text-xs text-muted">
                        {row.provider} · {typeLabels[row.type as FundingType] ?? row.type} ·{" "}
                        {row.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {(row.country_keys ?? []).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                          row.status === "published"
                            ? "bg-primary-light text-primary"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editRow(row)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void handleStatus(
                              row.id,
                              row.status === "published" ? "draft" : "published",
                            )
                          }
                          className="text-xs font-semibold text-muted hover:underline"
                        >
                          {row.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row.id)}
                          className="text-xs font-semibold text-red-700 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}
