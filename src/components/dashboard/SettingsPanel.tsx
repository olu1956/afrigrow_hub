"use client";

import { useEffect, useState } from "react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { useSession } from "@/components/providers/SessionProvider";
import { getSessionDataAction, updateUserProfileAction } from "@/lib/auth/profile-actions";
import { CountrySelect } from "@/components/dashboard/CountrySelect";
import { normalizeCountrySelectValue } from "@/lib/countries";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";

export function SettingsPanel() {
  const { session, setSession, authEnabled, authEmail, isPlatformAdmin } = useSession();
  const { business } = useDashboardBusiness();
  const [country, setCountry] = useState(() => normalizeCountrySelectValue(business.country || ""));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (business.country) {
      setCountry(normalizeCountrySelectValue(business.country));
    }
  }, [business.country]);

  const displayCountry = business.country || country;

  async function handleSaveCountry(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    if (!authEnabled) {
      setSession({ ...business, country, location: country });
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
      setSession({ ...business, country, location: country });
    }

    setMessage("Country saved to your profile.");
    setSaving(false);
  }

  return (
    <DashboardPageLayout
      title="Settings"
      description="Manage your account and business preferences."
    >
      <div className={`mx-auto max-w-2xl space-y-4 ${dashboardCardClass}`}>
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
    </DashboardPageLayout>
  );
}
