"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2, Mail, Phone } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import {
  getEnterpriseEnquiriesAction,
  updateEnterpriseEnquiryAction,
} from "@/lib/auth/enterprise-enquiry-actions";
import {
  enterpriseEnquiryStatusLabel,
  enterpriseEnquiryTypeLabel,
  enquiryListTitle,
} from "@/lib/enterprise/enquiry-mapper";
import {
  ENTERPRISE_ENQUIRY_STATUSES,
  ENTERPRISE_ENQUIRY_TYPES,
  type EnterpriseEnquiryStatus,
  type EnterpriseEnquiryType,
} from "@/lib/database/enterprise-enquiries";
import type { EnterpriseEnquiryView } from "@/lib/enterprise/enquiry-mapper";

const statusStyles: Record<EnterpriseEnquiryStatus, string> = {
  new: "bg-accent-light text-accent",
  contacted: "bg-primary-light text-primary",
  qualified: "bg-primary-light text-primary",
  won: "bg-primary text-white",
  closed: "bg-background text-muted border border-border",
};

const typeStyles: Record<EnterpriseEnquiryType, string> = {
  enterprise: "bg-primary-light text-primary",
  contact: "bg-accent-light text-accent",
  partner: "bg-blue-50 text-blue-700",
};

type FilterType = "all" | EnterpriseEnquiryType;

export function EnterpriseEnquiriesAdmin() {
  const [enquiries, setEnquiries] = useState<EnterpriseEnquiryView[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const result = await getEnterpriseEnquiriesAction();
      if (result.warning) {
        setSetupWarning(result.warning);
      }

      if (!result.ok) {
        setError(result.error ?? "Could not load enquiries.");
        setLoading(false);
        return;
      }

      const rows = result.enquiries ?? [];
      setEnquiries(rows);
      setSelectedId(rows[0]?.id ?? "");
      setLoading(false);
    }

    void load();
  }, []);

  const filteredEnquiries = useMemo(
    () =>
      filterType === "all"
        ? enquiries
        : enquiries.filter((item) => item.enquiryType === filterType),
    [enquiries, filterType],
  );

  const selected =
    filteredEnquiries.find((item) => item.id === selectedId) ?? filteredEnquiries[0];

  const stats = useMemo(
    () => ({
      total: enquiries.length,
      new: enquiries.filter((item) => item.status === "new").length,
      qualified: enquiries.filter((item) => item.status === "qualified").length,
      contact: enquiries.filter((item) => item.enquiryType === "contact").length,
      partner: enquiries.filter((item) => item.enquiryType === "partner").length,
    }),
    [enquiries],
  );

  useEffect(() => {
    if (filteredEnquiries.length === 0) {
      setSelectedId("");
      return;
    }

    if (!filteredEnquiries.some((item) => item.id === selectedId)) {
      setSelectedId(filteredEnquiries[0]?.id ?? "");
    }
  }, [filteredEnquiries, selectedId]);

  async function saveEnquiry(status: EnterpriseEnquiryStatus, adminNotes: string) {
    if (!selected) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    const result = await updateEnterpriseEnquiryAction({
      id: selected.id,
      status,
      adminNotes,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not update enquiry.");
      return;
    }

    setEnquiries((rows) =>
      rows.map((item) =>
        item.id === selected.id ? { ...item, status, adminNotes } : item,
      ),
    );
    setNotice("Enquiry updated.");
  }

  return (
    <DashboardPageLayout
      title="Inbound leads"
      description="Review contact messages, partner applications, and Enterprise sales enquiries."
      heroFooter={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total leads", value: stats.total },
            { label: "New", value: stats.new },
            { label: "Qualified", value: stats.qualified },
            { label: "Contact", value: stats.contact },
            { label: "Partner", value: stats.partner },
          ].map((item) => (
            <div key={item.label} className={`${dashboardCardClass} p-4`}>
              <p className="text-sm text-muted">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      }
      heroExtra={
        notice || setupWarning || error ? (
          <>
            {notice ? (
              <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
                {notice}
              </div>
            ) : null}
            {setupWarning ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {setupWarning}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </>
        ) : undefined
      }
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading enquiries…
        </div>
      ) : enquiries.length === 0 ? (
        <div className={`${dashboardCardClass} py-16 text-center`}>
          <Building2 className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-4 font-medium text-foreground">No inbound leads yet</p>
          <p className="mt-2 text-sm text-muted">
            Contact messages, partner applications, and Enterprise enquiries will appear here.
          </p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className={`${dashboardCardClass} py-16 text-center`}>
          <p className="font-medium text-foreground">No leads in this filter</p>
          <p className="mt-2 text-sm text-muted">Try another lead type.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className={`${dashboardCardClass} max-h-[640px] overflow-y-auto p-3 lg:col-span-2`}>
            <div className="mb-3 flex flex-wrap gap-2">
              {(["all", ...ENTERPRISE_ENQUIRY_TYPES] as FilterType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    filterType === type
                      ? "bg-primary text-white"
                      : "bg-background text-muted ring-1 ring-border hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "All" : enterpriseEnquiryTypeLabel(type)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredEnquiries.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full flex-col rounded-xl border p-4 text-left transition ${
                    selected?.id === item.id
                      ? "border-primary bg-primary-light"
                      : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      {enquiryListTitle(item)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeStyles[item.enquiryType]}`}
                      >
                        {enterpriseEnquiryTypeLabel(item.enquiryType)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[item.status]}`}
                      >
                        {enterpriseEnquiryStatusLabel(item.status)}
                      </span>
                    </span>
                  </span>
                  <span className="mt-1 text-sm text-muted">{item.name}</span>
                  <span className="mt-2 text-xs text-muted">{item.createdLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <EnquiryDetail
              key={selected.id}
              enquiry={selected}
              saving={saving}
              onSave={saveEnquiry}
            />
          ) : null}
        </div>
      )}
    </DashboardPageLayout>
  );
}

function EnquiryDetail({
  enquiry,
  saving,
  onSave,
}: {
  enquiry: EnterpriseEnquiryView;
  saving: boolean;
  onSave: (status: EnterpriseEnquiryStatus, adminNotes: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(enquiry.status);
  const [adminNotes, setAdminNotes] = useState(enquiry.adminNotes);

  useEffect(() => {
    setStatus(enquiry.status);
    setAdminNotes(enquiry.adminNotes);
  }, [enquiry]);

  return (
    <div className={`${dashboardCardClass} space-y-5 lg:col-span-3`}>
      <div>
        <h2 className="text-xl font-bold text-foreground">{enquiryListTitle(enquiry)}</h2>
        <p className="mt-1 text-sm text-muted">
          Submitted {enquiry.createdLabel} · {enterpriseEnquiryTypeLabel(enquiry.enquiryType)} ·
          Source: {enquiry.source}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={`mailto:${enquiry.email}`}
          className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm"
        >
          <Mail className="h-4 w-4 text-primary" />
          {enquiry.email}
        </a>
        {enquiry.phone ? (
          <a
            href={`tel:${enquiry.phone}`}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm"
          >
            <Phone className="h-4 w-4 text-primary" />
            {enquiry.phone}
          </a>
        ) : null}
        {enquiry.website ? (
          <a
            href={enquiry.website.startsWith("http") ? enquiry.website : `https://${enquiry.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm sm:col-span-2"
          >
            {enquiry.website}
          </a>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoBlock label="Contact" value={enquiry.name} />
        {enquiry.enquiryType === "contact" && enquiry.subject ? (
          <InfoBlock label="Subject" value={enquiry.subject} />
        ) : null}
        {enquiry.enquiryType === "enterprise" ? (
          <>
            <InfoBlock label="Team size" value={enquiry.teamSize || "Not specified"} />
            <InfoBlock label="Locations" value={enquiry.locations || "Not specified"} />
            <InfoBlock
              label="Interested in"
              value={
                enquiry.interestedIn.length > 0 ? enquiry.interestedIn.join(", ") : "Not specified"
              }
            />
          </>
        ) : null}
        {enquiry.enquiryType === "partner" && enquiry.companyName ? (
          <InfoBlock label="Company" value={enquiry.companyName} />
        ) : null}
      </div>

      <div className="rounded-xl bg-primary-light/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {enquiry.enquiryType === "partner" ? "Partnership offer" : "Message"}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{enquiry.message}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as EnterpriseEnquiryStatus)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            {ENTERPRISE_ENQUIRY_STATUSES.map((item) => (
              <option key={item} value={item}>
                {enterpriseEnquiryStatusLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="adminNotes" className="text-sm font-medium text-foreground">
          Admin notes
        </label>
        <textarea
          id="adminNotes"
          rows={4}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Follow-up notes, pricing discussed, next steps…"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave(status, adminNotes)}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
