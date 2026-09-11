"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCookieConsentAction,
  setCookieConsentAction,
  type CookieConsentChoice,
} from "@/lib/auth/cookie-consent-actions";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookies/constants";

function readStoredConsent(): CookieConsentChoice | null {
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (value === "essential" || value === "analytics") return value;
  } catch {
    // ignore
  }
  return null;
}

function storeConsent(choice: CookieConsentChoice) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);
  } catch {
    // ignore
  }
}

export function CookieBanner() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      setAnalytics(stored === "analytics");
      setOpen(false);
    } else {
      setOpen(true);
    }
    setReady(true);

    void (async () => {
      const server = await getCookieConsentAction();
      if (!server) return;
      if (stored) return;
      setAnalytics(server === "analytics");
      setOpen(false);
      storeConsent(server);
    })();

    function onOpenPreferences() {
      setReady(true);
      setPreferences(true);
      setOpen(true);
    }

    window.addEventListener("afrigrow:cookie-preferences", onOpenPreferences);
    return () => {
      window.removeEventListener("afrigrow:cookie-preferences", onOpenPreferences);
    };
  }, []);

  async function save(choice: CookieConsentChoice) {
    setSaving(true);
    storeConsent(choice);
    await setCookieConsentAction(choice);
    setAnalytics(choice === "analytics");
    setSaving(false);
    setOpen(false);
    setPreferences(false);
  }

  if (!ready || !open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p className="text-sm font-semibold text-foreground">Cookies on AfriGrow Hub</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Essential cookies keep you signed in. Analytics cookies count unique visits so we can
          show public totals — they are off until you accept. See our{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {preferences ? (
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <span>
              <span className="font-medium">Analytics</span>
              <span className="block text-muted">
                Store a random visitor id for 12 months so we can count visits, not who you are.
              </span>
            </span>
          </label>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {preferences ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void save(analytics ? "analytics" : "essential")}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save preferences"}
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("analytics")}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? "Saving…" : "Accept analytics"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("essential")}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-card disabled:opacity-60"
              >
                Essential only
              </button>
            </>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => setPreferences((current) => !current)}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-primary hover:underline disabled:opacity-60"
          >
            {preferences ? "Back" : "Customise"}
          </button>
        </div>
      </div>
    </div>
  );
}
