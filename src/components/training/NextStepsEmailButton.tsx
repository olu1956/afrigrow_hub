"use client";

import { useState } from "react";
import { sendMyNextStepsEmailAction } from "@/lib/auth/training-actions";

export function NextStepsEmailButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const result = await sendMyNextStepsEmailAction();
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Could not send the checklist.");
      return;
    }

    setMessage("Checklist emailed to you. Check Inbox and Spam.");
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleClick()}
        className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Email me this checklist"}
      </button>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
