"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Loader2,
  Megaphone,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import {
  DashboardStatGrid,
  dashboardCardClass,
  dashboardContentPanelClass,
  marketingEmptyStateClass,
  marketingFieldBorderClass,
} from "@/components/dashboard/DashboardPageCanvas";
import { ContentCard } from "@/components/marketing/ContentCard";
import { useSession } from "@/components/providers/SessionProvider";
import { getBusinessProfileAction } from "@/lib/auth/business-actions";
import {
  getMarketingCampaignsAction,
  saveMarketingCampaignAction,
} from "@/lib/auth/marketing-actions";
import {
  buildDefaultBrief,
  buildGeneratedContent,
  buildQuickTemplates,
  contentTypes,
  goalOptions,
  platformOptions,
  toneOptions,
  type CampaignBrief,
  type ContentType,
  type GeneratedContent,
} from "@/lib/marketing-data";
import {
  buildDefaultProfile,
  formatProfileLocation,
  loadProfilePreview,
  type BusinessProfile,
} from "@/lib/profile-data";

const inputClass = `w-full rounded-xl ${marketingFieldBorderClass} bg-white px-4 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-foreground/45 hover:border-[#9fb0a8] focus:border-primary focus:ring-2 focus:ring-primary/20`;

const contentTypeTileClass = (selected: boolean) =>
  selected
    ? "border-2 border-primary bg-primary-light"
    : `${marketingFieldBorderClass} bg-white hover:border-primary/50`;

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

export function MarketingAgent() {
  const { session, hydrated, setSession, authEnabled } = useSession();
  const initialized = useRef(false);
  const [profile, setProfile] = useState<BusinessProfile>(() => buildDefaultProfile(session));
  const [brief, setBrief] = useState<CampaignBrief>(() => buildDefaultBrief(session));
  const [contentType, setContentType] = useState<ContentType>("social");
  const [generating, setGenerating] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(authEnabled);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [drafts, setDrafts] = useState<GeneratedContent[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [savedGeneratedId, setSavedGeneratedId] = useState<string | null>(null);
  const [highlightDraftId, setHighlightDraftId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    campaignsThisMonth: 0,
    scheduledPosts: 0,
    totalCampaigns: 0,
  });
  const draftsSectionRef = useRef<HTMLElement>(null);

  const quickTemplates = buildQuickTemplates(session, profile);

  useEffect(() => {
    if (!hydrated || initialized.current) return;

    async function init() {
      if (authEnabled) {
        setLoadingCampaigns(true);
        setError(null);

        const [profileResult, campaignsResult] = await Promise.all([
          getBusinessProfileAction(),
          getMarketingCampaignsAction(),
        ]);

        if (profileResult.ok && profileResult.profile) {
          setProfile(profileResult.profile);
          setBrief(buildDefaultBrief(session, profileResult.profile));

          const location = formatProfileLocation(profileResult.profile);
          const businessName = profileResult.profile.businessName.trim();
          const sessionUpdates: Partial<{
            location: string;
            name: string;
            businessType: string;
          }> = {};

          if (location && location !== session.location) {
            sessionUpdates.location = location;
          }
          if (businessName && businessName !== session.name) {
            sessionUpdates.name = businessName;
          }
          if (
            profileResult.profile.category &&
            profileResult.profile.category !== session.businessType
          ) {
            sessionUpdates.businessType = profileResult.profile.category;
          }

          if (Object.keys(sessionUpdates).length > 0) {
            setSession({
              owner: session.owner,
              name: sessionUpdates.name ?? session.name,
              email: session.email,
              ...sessionUpdates,
            });
          }
        } else {
          const savedProfile = loadProfilePreview(session);
          setProfile(savedProfile);
          setBrief(buildDefaultBrief(session, savedProfile));
        }

        if (campaignsResult.ok) {
          setDrafts(campaignsResult.campaigns ?? []);
          if (campaignsResult.stats) {
            setStats(campaignsResult.stats);
          }
        } else {
          setError(campaignsResult.error ?? "Unable to load saved campaigns.");
        }

        setLoadingCampaigns(false);
      } else {
        const savedProfile = loadProfilePreview(session);
        setProfile(savedProfile);
        setBrief(buildDefaultBrief(session, savedProfile));
      }

      initialized.current = true;
    }

    void init();
  }, [authEnabled, hydrated, session, setSession]);

  function updateBrief<K extends keyof CampaignBrief>(key: K, value: CampaignBrief[K]) {
    setBrief((b) => ({ ...b, [key]: value }));
  }

  function applyTemplate(topic: string) {
    updateBrief("topic", topic);
  }

  async function generate() {
    setGenerating(true);
    setGenerated(null);
    setError(null);
    await new Promise((r) => setTimeout(r, 1400));
    const mock = buildGeneratedContent(session, brief, contentType, profile);
    const id = `gen-${Date.now()}`;
    setGenerated({
      ...mock,
      id,
      platform: brief.platform,
      createdAt: "Just now",
    });
    setSavedGeneratedId(null);
    setGenerating(false);
  }

  async function saveDraft() {
    if (!generated || savedGeneratedId === generated.id || savingDraft) return;

    setSavingDraft(true);
    setError(null);

    if (authEnabled) {
      const result = await saveMarketingCampaignAction({
        campaignType: generated.type,
        title: generated.title,
        brief,
        body: generated.body,
        hashtags: generated.hashtags,
        status: "generated",
      });

      if (!result.ok || !result.campaign) {
        setError(result.error ?? "Unable to save campaign.");
        setSavingDraft(false);
        return;
      }

      setDrafts((current) => [result.campaign!, ...current]);
      setStats((current) => ({
        campaignsThisMonth: current.campaignsThisMonth + 1,
        scheduledPosts: current.scheduledPosts,
        totalCampaigns: current.totalCampaigns + 1,
      }));
      setSavedGeneratedId(generated.id);
      setHighlightDraftId(result.campaign.id);
      setSavedNotice(true);
      setSavingDraft(false);

      window.setTimeout(() => setSavedNotice(false), 3000);
      window.setTimeout(() => setHighlightDraftId(null), 4000);
      draftsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const draftId = `draft-${Date.now()}`;
    const draft: GeneratedContent = {
      ...generated,
      id: draftId,
      platform: brief.platform,
      createdAt: "Just now",
      status: "generated",
    };

    setDrafts((d) => [draft, ...d]);
    setSavedGeneratedId(generated.id);
    setHighlightDraftId(draftId);
    setSavedNotice(true);
    setSavingDraft(false);

    window.setTimeout(() => setSavedNotice(false), 3000);
    window.setTimeout(() => setHighlightDraftId(null), 4000);
    draftsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const estimatedReach =
    stats.totalCampaigns > 0
      ? `${Math.max(stats.totalCampaigns * 300, 300).toLocaleString()}`
      : "—";

  return (
    <DashboardPageLayout
      title="Marketing Agent"
      description="Create social posts, WhatsApp broadcasts, flyer copy, and email promos — powered by AI for your brand voice."
      action={
        <button
          type="button"
          onClick={generate}
          disabled={generating || !brief.topic.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate content
        </button>
      }
      heroExtra={
        error || savedNotice ? (
          <>
            {error && (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
            {savedNotice && (
              <div className="rounded-xl border border-primary/25 bg-card/90 px-4 py-3 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
                Campaign saved to your library.
              </div>
            )}
          </>
        ) : undefined
      }
      heroFooter={
        <DashboardStatGrid
          stats={[
            {
              icon: Megaphone,
              label: "Campaigns this month",
              value: authEnabled ? String(stats.campaignsThisMonth) : "—",
            },
            {
              icon: TrendingUp,
              label: "Est. reach",
              value: authEnabled ? estimatedReach : "—",
            },
            {
              icon: Calendar,
              label: "Scheduled posts",
              value: authEnabled ? String(stats.scheduledPosts) : "—",
            },
          ]}
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <section className={dashboardCardClass}>
            <h2 className="mb-4 font-semibold text-foreground">Content type</h2>
            <div className="grid grid-cols-2 gap-2">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setContentType(type.id);
                    setGenerated(null);
                    setSavedGeneratedId(null);
                  }}
                  className={`rounded-xl p-3 text-left transition ${contentTypeTileClass(contentType === type.id)}`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      contentType === type.id ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {type.label}
                  </p>
                  <p
                    className={`mt-0.5 text-xs ${
                      contentType === type.id ? "text-primary/80" : "text-foreground/70"
                    }`}
                  >
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className={dashboardCardClass}>
            <h2 className="mb-4 font-semibold text-foreground">Campaign brief</h2>
            <div className="space-y-4">
              <Field label="Topic / promotion">
                <textarea
                  rows={2}
                  className={`${inputClass} resize-y`}
                  value={brief.topic}
                  onChange={(e) => updateBrief("topic", e.target.value)}
                />
              </Field>
              <Field label="Target audience">
                <input
                  className={inputClass}
                  value={brief.audience}
                  onChange={(e) => updateBrief("audience", e.target.value)}
                />
              </Field>
              <Field label="Tone">
                <select
                  className={inputClass}
                  value={brief.tone}
                  onChange={(e) => updateBrief("tone", e.target.value)}
                >
                  {toneOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Goal">
                <select
                  className={inputClass}
                  value={brief.goal}
                  onChange={(e) => updateBrief("goal", e.target.value)}
                >
                  {goalOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Primary platform">
                <select
                  className={inputClass}
                  value={brief.platform}
                  onChange={(e) => updateBrief("platform", e.target.value)}
                >
                  {platformOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className={dashboardCardClass}>
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <h2 className="font-semibold text-foreground">Quick templates</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t.topic)}
                  className={`rounded-full ${marketingFieldBorderClass} bg-white px-3 py-1.5 text-xs font-medium text-foreground/85 transition hover:border-primary/50 hover:bg-primary-light/50 hover:text-foreground`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <section className={`${dashboardContentPanelClass} min-h-[320px]`}>
            <h2 className="mb-4 font-semibold text-foreground">Generated content</h2>
            {generating && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 font-medium text-foreground">
                  Marketing Agent is writing…
                </p>
                <p className="mt-1 text-sm text-muted">
                  Crafting {contentTypes.find((t) => t.id === contentType)?.label.toLowerCase()} for{" "}
                  {brief.platform}
                </p>
              </div>
            )}
            {!generating && generated && (
              <ContentCard
                content={generated}
                onSave={saveDraft}
                saved={savedGeneratedId === generated.id}
                saving={savingDraft}
              />
            )}
            {!generating && !generated && (
              <div className={marketingEmptyStateClass}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light/90">
                  <Sparkles className="h-7 w-7 text-primary/45" />
                </span>
                <p className="mt-4 font-medium text-foreground">Ready to create</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Fill in your campaign brief and click{" "}
                  <span className="font-medium text-primary">Generate content</span> to see your
                  marketing copy here.
                </p>
              </div>
            )}
          </section>

          <section
            ref={draftsSectionRef}
            className={`${dashboardContentPanelClass} scroll-mt-24`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Saved campaigns</h2>
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                {loadingCampaigns ? "…" : `${drafts.length} ${drafts.length === 1 ? "item" : "items"}`}
              </span>
            </div>
            {loadingCampaigns ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : drafts.length === 0 ? (
              <p className="text-sm text-muted">
                Saved campaigns will appear here after you generate content and click Save draft.
              </p>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <ContentCard
                    key={draft.id}
                    content={draft}
                    highlighted={highlightDraftId === draft.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
