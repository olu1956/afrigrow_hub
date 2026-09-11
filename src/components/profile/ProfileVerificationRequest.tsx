"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, ShieldCheck } from "lucide-react";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { VerificationBadge } from "@/components/trust/VerificationBadge";
import { useSession } from "@/components/providers/SessionProvider";
import {
  getMyVerificationStatusAction,
  submitVerificationRequestAction,
  type VerificationRequestView,
} from "@/lib/auth/verification-actions";
import { uploadVerificationDocumentToStorage } from "@/lib/business/verification-document-upload";
import { createClient } from "@/lib/supabase/client";
import type { BusinessProfile } from "@/lib/profile-data";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

type ProfileVerificationRequestProps = {
  profile: BusinessProfile;
};

export function ProfileVerificationRequest({ profile }: ProfileVerificationRequestProps) {
  const { authEnabled } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [request, setRequest] = useState<VerificationRequestView | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [documentPath, setDocumentPath] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    if (!authEnabled) {
      setLoading(false);
      return;
    }

    const result = await getMyVerificationStatusAction();
    if (result.ok) {
      setIsVerified(result.isVerified);
      setRequest(result.request ?? null);
      if (result.request) {
        setRegistrationNumber(result.request.registrationNumber);
        setNotes(result.request.notes);
        setDocumentPath(result.request.documentPath);
        setDocumentName(result.request.documentName);
      }
    } else {
      setError(result.error ?? "Could not load verification status.");
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once after auth is known
  }, [authEnabled]);

  async function handleDocument(file: File) {
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sign in to upload a verification document.");
      return;
    }

    const uploaded = await uploadVerificationDocumentToStorage(file, user.id);
    if (!uploaded.ok) {
      setError(uploaded.error);
      return;
    }

    setDocumentPath(uploaded.path);
    setDocumentName(uploaded.name);
    setMessage("Document attached. Submit the request to send it for review.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const result = await submitVerificationRequestAction({
      registrationNumber,
      website: profile.website,
      instagram: profile.instagram,
      facebook: profile.facebook,
      linkedin: profile.linkedin,
      notes,
      documentPath,
      documentName,
    });

    if (!result.ok) {
      setError(result.error ?? "Could not submit verification request.");
      setSubmitting(false);
      return;
    }

    setMessage("Request sent. AfriGrow will review and grant the Verified badge if the details check out.");
    await loadStatus();
    setSubmitting(false);
  }

  if (!authEnabled) {
    return (
      <section className={dashboardCardClass}>
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Get verified</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          In preview mode, verification requests are not sent. Sign in on the live site to
          submit your registration number and evidence pack.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={`${dashboardCardClass} flex items-center gap-2 text-sm text-muted`}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Checking verification status…
      </section>
    );
  }

  if (isVerified) {
    return (
      <section className={dashboardCardClass}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Verification</h2>
          <VerificationBadge verified />
        </div>
        <p className="text-sm leading-relaxed text-muted">
          Your business is verified. Keep your website, logo, and services up to date so
          members can trust what they see in the directory.
        </p>
      </section>
    );
  }

  const pending = request?.status === "pending";
  const rejected = request?.status === "rejected";

  return (
    <section className={dashboardCardClass}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Get the Verified badge</h2>
        <VerificationBadge verified={false} />
      </div>
      <p className="text-sm leading-relaxed text-muted">
        Anyone can join and appear in the directory at 40% profile strength. The Verified
        badge is earned after AfriGrow checks your registration details and online presence.
      </p>

      {pending ? (
        <p className="mt-4 rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
          Your request is under review. You can still update the pack below until it is decided.
        </p>
      ) : null}
      {rejected ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {request?.adminNote
            ? `Not verified yet: ${request.adminNote}`
            : "Your last request was not approved. Update the details and submit again."}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="registrationNumber">
            Business registration number
          </label>
          <input
            id="registrationNumber"
            className={inputClass}
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="CAC, Companies House, or local equivalent"
            disabled={submitting}
            required
          />
        </div>
        <p className="text-xs text-muted">
          We will use the website and social links already on this profile
          {profile.website ? ` (${profile.website})` : ""}. Save those first if you have just
          added them.
        </p>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground" htmlFor="verificationNotes">
            Anything else we should check (optional)
          </label>
          <textarea
            id="verificationNotes"
            rows={3}
            className={`${inputClass} resize-y`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Trading name, storefront, or a public listing we can match."
          />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Evidence document (optional)</p>
          <p className="mt-1 text-xs text-muted">
            Registration certificate, utility bill, or storefront photo. JPEG, PNG, WebP or PDF ·
            max 5 MB. Stored privately — not shown in the directory.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleDocument(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-light px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            <FileUp className="h-3.5 w-3.5" />
            {documentName ? "Replace document" : "Attach document"}
          </button>
          {documentName ? (
            <p className="mt-2 text-xs text-foreground">Attached: {documentName}</p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary" role="status">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Sending…" : pending ? "Update request" : "Submit for verification"}
        </button>
      </form>
    </section>
  );
}
