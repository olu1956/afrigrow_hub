"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { useSession } from "@/components/providers/SessionProvider";
import { getSessionDataAction, updateUserProfileAction } from "@/lib/auth/profile-actions";
import {
  deleteOwnAccountAction,
  exportAccountDataAction,
  getAccountPrivacySettingsAction,
  setDirectoryOptOutAction,
} from "@/lib/auth/account-privacy-actions";
import { CountrySelect } from "@/components/dashboard/CountrySelect";
import { normalizeCountrySelectValue } from "@/lib/countries";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import { clearSessionPreview } from "@/lib/session-preview";

export function SettingsPanel() {
  const router = useRouter();
  const { session, setSession, authEnabled, authEmail, isPlatformAdmin, signOut } = useSession();
  const { business } = useDashboardBusiness();
  const [country, setCountry] = useState(() => normalizeCountrySelectValue(business.country || ""));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [directoryOptOut, setDirectoryOptOut] = useState(false);
  const [directoryHiddenByAdmin, setDirectoryHiddenByAdmin] = useState(false);
  const [listed, setListed] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (business.country) {
      setCountry(normalizeCountrySelectValue(business.country));
    }
  }, [business.country]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await getAccountPrivacySettingsAction();
      if (!active || !result.ok) return;
      setDirectoryOptOut(Boolean(result.directoryOptOut));
      setDirectoryHiddenByAdmin(Boolean(result.directoryHiddenByAdmin));
      setListed(Boolean(result.listed));
    })();
    return () => {
      active = false;
    };
  }, []);

  const displayCountry = business.country || country;

  async function handleSaveCountry(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    if (!authEnabled) {
      setSession({ ...session, country, location: country });
      setMessage("Country saved locally (preview mode).");
      setSaving(false);
      return;
    }

    const result = await updateUserProfileAction({ country });

    if (!result.ok) {
      setError(result.error ?? "Unable to save country.");
      setSaving(false);
      return;
    }

    const refreshed = await getSessionDataAction();
    if (refreshed) {
      setSession(refreshed.session);
      setCountry(refreshed.session.country);
    } else {
      setSession({ ...session, country, location: country });
    }

    setMessage("Country saved to your profile.");
    setSaving(false);
  }

  async function handleVisibility(optOut: boolean) {
    setSavingVisibility(true);
    setError(null);
    setMessage(null);

    if (!authEnabled) {
      setDirectoryOptOut(optOut);
      setListed(!optOut);
      setMessage(
        optOut
          ? "Directory listing hidden in this browser (preview mode)."
          : "Directory listing allowed in this browser (preview mode).",
      );
      setSavingVisibility(false);
      return;
    }

    const result = await setDirectoryOptOutAction(optOut);
    if (!result.ok) {
      setError(result.error ?? "Could not update directory visibility.");
      setSavingVisibility(false);
      return;
    }

    const refreshed = await getAccountPrivacySettingsAction();
    if (refreshed.ok) {
      setDirectoryOptOut(Boolean(refreshed.directoryOptOut));
      setDirectoryHiddenByAdmin(Boolean(refreshed.directoryHiddenByAdmin));
      setListed(Boolean(refreshed.listed));
    } else {
      setDirectoryOptOut(optOut);
    }
    setMessage(
      optOut
        ? "Your business is hidden from the directory."
        : "Your business can appear in the directory when your profile is complete.",
    );
    setSavingVisibility(false);
  }

  async function handleExport() {
    setExporting(true);
    setError(null);
    setMessage(null);
    const result = await exportAccountDataAction();
    if (!result.ok || !result.payload || !result.filename) {
      setError(result.error ?? "Could not prepare your data download.");
      setExporting(false);
      return;
    }

    const blob = new Blob([result.payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("Your data download has started.");
    setExporting(false);
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (
      !window.confirm(
        "This permanently deletes your AfriGrow account, profile, CRM, campaigns, and listing. This cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);
    setMessage(null);

    const result = await deleteOwnAccountAction(deleteConfirmation);
    if (!result.ok) {
      setError(result.error ?? "Could not delete your account.");
      setDeleting(false);
      return;
    }

    try {
      window.localStorage.removeItem("afrigrow_profile_preview");
    } catch {
      // ignore
    }
    clearSessionPreview();
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DashboardPageLayout
      title="Settings"
      description="Manage your account, directory visibility, and data."
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <div className={`space-y-4 ${dashboardCardClass}`}>
          <div>
            <label className="text-sm font-medium text-foreground">Business name</label>
            <input
              readOnly
              value={business.name}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Owner</label>
            <input
              readOnly
              value={business.owner}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Login email</label>
            <input
              readOnly
              value={authEmail || business.email}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted"
            />
            <p className="mt-1 text-xs text-muted">
              Platform admin access is tied to this login email.
            </p>
            {authEnabled ? (
              <p
                className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                  isPlatformAdmin
                    ? "border border-primary/20 bg-primary-light text-primary"
                    : "border border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                {isPlatformAdmin
                  ? "Platform admin access: active (Admin section visible in sidebar)."
                  : `Platform admin access: not active for ${authEmail || "this account"}. Run supabase/scripts/promote_platform_admin.sql with your login email, or add it to PLATFORM_ADMIN_EMAILS.`}
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Business contact email</label>
            <input
              readOnly
              value={business.email}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted"
            />
          </div>

          <form onSubmit={handleSaveCountry} className="space-y-3 border-t border-border pt-4">
            <div>
              <label htmlFor="country" className="text-sm font-medium text-foreground">
                Country
              </label>
              <CountrySelect
                id="country"
                name="country"
                value={country || normalizeCountrySelectValue(displayCountry)}
                onChange={setCountry}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {!displayCountry && (
                <p className="mt-1.5 text-xs text-muted">No country set yet — choose one and save.</p>
              )}
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !country}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save country"}
            </button>
          </form>

          <div>
            <label className="text-sm font-medium text-foreground">Plan</label>
            <input
              readOnly
              value={business.plan}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted"
            />
          </div>
        </div>

        <div className={dashboardCardClass}>
          <h2 className="font-semibold text-foreground">Directory visibility</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Profile fields you publish can appear in the Business Directory at {DIRECTORY_MIN_PROFILE_SCORE}%
            strength. CRM contacts, funding numbers, and campaign drafts stay private.
          </p>
          {directoryHiddenByAdmin ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              An AfriGrow admin has unlisted this business. Turning visibility on here will not show you
              until they relist you.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {listed
                ? "Your business is currently discoverable in the directory."
                : directoryOptOut
                  ? "You have hidden your listing."
                  : "Complete your profile to appear in the directory."}
            </p>
          )}
          <button
            type="button"
            disabled={savingVisibility}
            onClick={() => void handleVisibility(!directoryOptOut)}
            className="mt-4 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background disabled:opacity-60"
          >
            {savingVisibility
              ? "Saving…"
              : directoryOptOut
                ? "Show me in the directory"
                : "Hide me from the directory"}
          </button>
        </div>

        <div className={dashboardCardClass}>
          <h2 className="font-semibold text-foreground">Download my data</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Get a JSON copy of your profile, business, CRM, campaigns, matches, funding answers,
            invoices, and training enrolments.
          </p>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void handleExport()}
            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {exporting ? "Preparing…" : "Download my data"}
          </button>
        </div>

        <div className={dashboardCardClass}>
          <h2 className="font-semibold text-foreground">Delete my account</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This removes your login, business listing, and private workspace data. Type{" "}
            <span className="font-semibold text-foreground">DELETE</span> to confirm.
          </p>
          <form onSubmit={(e) => void handleDelete(e)} className="mt-4 space-y-3">
            <input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={deleting || deleteConfirmation.trim().toUpperCase() !== "DELETE"}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
          </form>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
