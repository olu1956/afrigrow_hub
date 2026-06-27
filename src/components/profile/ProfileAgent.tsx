"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";
import { useSession } from "@/components/providers/SessionProvider";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { ProfileStrengthMeter } from "@/components/profile/ProfileStrengthMeter";
import {
  getBusinessProfileAction,
  saveBusinessProfileAction,
  updateBusinessLogoAction,
} from "@/lib/auth/business-actions";
import { getMyDirectoryStatusAction } from "@/lib/auth/directory-actions";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import { uploadBusinessLogoToStorage } from "@/lib/business/logo-upload";
import { createClient } from "@/lib/supabase/client";
import { getSessionDataAction } from "@/lib/auth/profile-actions";
import {
  buildAiBioSuggestion,
  buildAiServiceSuggestions,
  buildAiTaglineSuggestion,
  buildDefaultProfile,
  calculateProfileStrength,
  formatProfileLocation,
  loadProfilePreview,
  profileCategories,
  saveProfilePreview,
  type BusinessProfile,
} from "@/lib/profile-data";
import { CountrySelect } from "@/components/dashboard/CountrySelect";
import { normalizeCountrySelectValue } from "@/lib/countries";
import { defaultSession } from "@/lib/session-preview";

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

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ProfileAgent() {
  const { session, hydrated, setSession, authEnabled } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<BusinessProfile>(() =>
    buildDefaultProfile(defaultSession()),
  );
  const [newService, setNewService] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [initialized, setInitialized] = useState(false);
  const [savedStrength, setSavedStrength] = useState<number | null>(null);
  const [listedInDirectory, setListedInDirectory] = useState(false);
  const [directoryNotice, setDirectoryNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || initialized) return;

    async function loadProfile() {
      setLoadingProfile(true);
      setError(null);

      if (authEnabled) {
        const [result, directoryStatus] = await Promise.all([
          getBusinessProfileAction(),
          getMyDirectoryStatusAction(),
        ]);

        if (result.ok && result.profile) {
          setProfile({
            ...result.profile,
            country: normalizeCountrySelectValue(result.profile.country),
          });
          setSavedStrength(result.profile.profileScore ?? null);
        } else if (result.error) {
          setError(result.error);
          setProfile(buildDefaultProfile(session));
        } else {
          setProfile(buildDefaultProfile(session));
        }

        if (directoryStatus.ok) {
          setListedInDirectory(directoryStatus.listed);
          if (directoryStatus.profileScore !== null) {
            setSavedStrength((current) => current ?? directoryStatus.profileScore);
          }
        }
      } else {
        setProfile(loadProfilePreview(session));
      }

      setLoadingProfile(false);
      setInitialized(true);
    }

    loadProfile();
  }, [authEnabled, hydrated, initialized, session]);

  const strength = useMemo(() => calculateProfileStrength(profile), [profile]);

  function update<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function runAi(action: "bio" | "tagline" | "services") {
    setAiLoading(action);
    await new Promise((r) => setTimeout(r, 1200));
    if (action === "bio") update("bio", buildAiBioSuggestion(session, profile));
    if (action === "tagline") update("tagline", buildAiTaglineSuggestion(session));
    if (action === "services") {
      const suggested = buildAiServiceSuggestions(session, profile.category);
      const merged = [...new Set([...profile.services, ...suggested])];
      update("services", merged);
    }
    setAiLoading(null);
  }

  function addService() {
    const trimmed = newService.trim();
    if (!trimmed || profile.services.includes(trimmed)) return;
    update("services", [...profile.services, trimmed]);
    setNewService("");
  }

  function removeService(service: string) {
    update(
      "services",
      profile.services.filter((s) => s !== service),
    );
  }

  async function handleLogoUpload(file: File) {
    if (!authEnabled) {
      setError("Logo upload requires Supabase to be configured.");
      return;
    }

    setUploadingLogo(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setUploadingLogo(false);
      return;
    }

    const upload = await uploadBusinessLogoToStorage(file, user.id);
    if (!upload.ok) {
      setError(upload.error);
      setUploadingLogo(false);
      return;
    }

    const result = await updateBusinessLogoAction(upload.publicUrl);

    if (!result.ok) {
      setError(result.error ?? "Unable to upload logo.");
      setUploadingLogo(false);
      return;
    }

    if (result.logoUrl) {
      update("logoUrl", result.logoUrl);
    }
    if (result.profileScore !== undefined) {
      setProfile((p) => ({ ...p, profileScore: result.profileScore }));
    }

    setUploadingLogo(false);
    setSaved(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    if (authEnabled) {
      const result = await saveBusinessProfileAction(profile);

      if (!result.ok) {
        setError(result.error ?? "Unable to save profile.");
        setSaving(false);
        return;
      }

      if (result.profile) {
        setProfile(result.profile);
      }

      const newStrength = calculateProfileStrength(result.profile ?? profile);
      const previousSaved = savedStrength ?? 0;
      setSavedStrength(newStrength);
      setListedInDirectory(newStrength >= DIRECTORY_MIN_PROFILE_SCORE);

      if (
        newStrength >= DIRECTORY_MIN_PROFILE_SCORE &&
        previousSaved < DIRECTORY_MIN_PROFILE_SCORE
      ) {
        setDirectoryNotice(
          "Your profile is now live in the Business Directory — other members can discover you.",
        );
      } else if (newStrength >= DIRECTORY_MIN_PROFILE_SCORE) {
        setDirectoryNotice(null);
      }

      const refreshedSession = await getSessionDataAction();
      if (refreshedSession) {
        setSession(refreshedSession.session);
      } else {
        const location = formatProfileLocation(profile);
        setSession({
          owner: session.owner,
          name: profile.businessName.trim() || session.name,
          email: profile.email.trim() || session.email,
          country: profile.country.trim() || session.country,
          businessType: profile.category,
          ...(location ? { location } : {}),
        });
      }

      setSaved(true);
      setSaving(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 600));
    saveProfilePreview(profile);
    const location = formatProfileLocation(profile);
    setSession({
      owner: session.owner,
      name: profile.businessName.trim() || session.name,
      email: profile.email.trim() || session.email,
      country: profile.country.trim() || session.country,
      businessType: profile.category,
      ...(location ? { location } : {}),
    });
    setSaved(true);
    setSaving(false);
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardPageLayout
      title="Business Profile Agent"
      description="Build a professional profile that helps buyers, partners, and funders discover and trust your business."
      action={
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save profile
        </button>
      }
      heroExtra={
        error || saved || directoryNotice ? (
          <>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}
            {saved && (
              <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm font-medium text-primary">
                Profile saved{authEnabled ? " to your business account" : " (preview mode)"}.
                {directoryNotice ? ` ${directoryNotice}` : ""}
              </div>
            )}
            {!saved && directoryNotice ? (
              <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm font-medium text-primary">
                {directoryNotice}
              </div>
            ) : null}
          </>
        ) : undefined
      }
    >
      <div className="flex gap-2 lg:hidden">
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-primary text-white"
                : "border border-border bg-card text-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div
          className={`space-y-6 lg:col-span-3 ${activeTab === "preview" ? "hidden lg:block" : ""}`}
        >
          <section className={dashboardCardClass}>
            <div className="mb-5 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Basic information</h2>
            </div>

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-primary-light">
                {profile.logoUrl ? (
                  <Image
                    src={profile.logoUrl}
                    alt={`${profile.businessName} logo`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">{session.initials}</span>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Business logo</p>
                <p className="text-xs text-muted">JPEG, PNG, WebP or GIF · max 2 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleLogoUpload(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-light px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                  {profile.logoUrl ? "Change logo" : "Upload logo"}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name">
                <input
                  className={inputClass}
                  value={profile.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                />
              </Field>
              <Field label="Category">
                <select
                  className={inputClass}
                  value={profile.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {profileCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Tagline">
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      value={profile.tagline}
                      onChange={(e) => update("tagline", e.target.value)}
                      placeholder="A short line that captures what you do"
                    />
                    <button
                      type="button"
                      onClick={() => runAi("tagline")}
                      disabled={aiLoading === "tagline"}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-light px-3 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
                    >
                      {aiLoading === "tagline" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5" />
                      )}
                      AI
                    </button>
                  </div>
                </Field>
              </div>
              <Field label="Year founded">
                <input
                  className={inputClass}
                  value={profile.foundedYear}
                  onChange={(e) => update("foundedYear", e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className={dashboardCardClass}>
            <h2 className="mb-5 font-semibold text-foreground">Location</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City">
                <input
                  className={inputClass}
                  value={profile.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </Field>
              <Field label="Country">
                <CountrySelect
                  value={normalizeCountrySelectValue(profile.country)}
                  onChange={(value) => update("country", value)}
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <input
                    className={inputClass}
                    value={profile.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className={dashboardCardClass}>
            <h2 className="mb-5 font-semibold text-foreground">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input
                  className={inputClass}
                  value={profile.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  className={inputClass}
                  value={profile.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className={inputClass}
                  value={profile.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
              <Field label="Website">
                <input
                  className={inputClass}
                  value={profile.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className={dashboardCardClass}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground">About your business</h2>
              <button
                type="button"
                onClick={() => runAi("bio")}
                disabled={aiLoading === "bio"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {aiLoading === "bio" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate with AI
              </button>
            </div>
            <textarea
              rows={5}
              className={`${inputClass} resize-y`}
              value={profile.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell buyers and partners what makes your business unique…"
            />
            <p className="mt-1.5 text-xs text-muted">
              {profile.bio.length} characters · aim for 80+ for a strong profile
            </p>
          </section>

          <section className={dashboardCardClass}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground">Services</h2>
              <button
                type="button"
                onClick={() => runAi("services")}
                disabled={aiLoading === "services"}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-light px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
              >
                {aiLoading === "services" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                Suggest services
              </button>
            </div>
            <ul className="space-y-2">
              {profile.services.map((service) => (
                <li
                  key={service}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5"
                >
                  <span className="text-sm text-foreground">{service}</span>
                  <button
                    type="button"
                    onClick={() => removeService(service)}
                    className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${service}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input
                className={inputClass}
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a service"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              />
              <button
                type="button"
                onClick={addService}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </section>

          <section className={dashboardCardClass}>
            <h2 className="mb-5 font-semibold text-foreground">Social links</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Instagram">
                <input
                  className={inputClass}
                  value={profile.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                />
              </Field>
              <Field label="Facebook">
                <input
                  className={inputClass}
                  value={profile.facebook}
                  onChange={(e) => update("facebook", e.target.value)}
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  className={inputClass}
                  value={profile.linkedin}
                  onChange={(e) => update("linkedin", e.target.value)}
                />
              </Field>
            </div>
          </section>
        </div>

        <div
          className={`space-y-5 lg:col-span-2 ${activeTab === "edit" ? "hidden lg:block" : ""}`}
        >
          <div className="lg:sticky lg:top-24 lg:space-y-5">
            <ProfileStrengthMeter
              strength={strength}
              profile={profile}
              savedStrength={savedStrength}
              listed={listedInDirectory}
              onSaveProfile={() => void handleSave()}
            />
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Live preview</p>
              <ProfilePreview profile={profile} initials={session.initials} />
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
