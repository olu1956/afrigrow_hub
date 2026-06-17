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
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ContentCard } from "@/components/marketing/ContentCard";
import { useSession } from "@/components/providers/SessionProvider";
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
  formatProfileLocation,
  loadProfilePreview,
} from "@/lib/profile-data";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

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
  const { session, hydrated, setSession } = useSession();
  const initialized = useRef(false);
  const [brief, setBrief] = useState<CampaignBrief>(() => buildDefaultBrief(session));
  const [contentType, setContentType] = useState<ContentType>("social");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [drafts, setDrafts] = useState<GeneratedContent[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [savedGeneratedId, setSavedGeneratedId] = useState<string | null>(null);
  const [highlightDraftId, setHighlightDraftId] = useState<string | null>(null);
  const draftsSectionRef = useRef<HTMLElement>(null);

  const profile = hydrated ? loadProfilePreview(session) : null;
  const quickTemplates = buildQuickTemplates(session, profile ?? undefined);

  useEffect(() => {
    if (!hydrated || initialized.current) return;

    const savedProfile = loadProfilePreview(session);
    setBrief(buildDefaultBrief(session, savedProfile));

    const location = formatProfileLocation(savedProfile);
    const businessName = savedProfile.businessName.trim();
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
      savedProfile.category &&
      savedProfile.category !== session.businessType
    ) {
      sessionUpdates.businessType = savedProfile.category;
    }

    if (Object.keys(sessionUpdates).length > 0) {
      setSession({
        owner: session.owner,
        name: sessionUpdates.name ?? session.name,
        email: session.email,
        ...sessionUpdates,
      });
    }

    initialized.current = true;
  }, [hydrated, session, setSession]);

  function updateBrief<K extends keyof CampaignBrief>(key: K, value: CampaignBrief[K]) {
    setBrief((b) => ({ ...b, [key]: value }));
  }

  function applyTemplate(topic: string) {
    updateBrief("topic", topic);
  }

  async function generate() {
    setGenerating(true);
    setGenerated(null);
    await new Promise((r) => setTimeout(r, 1400));
    const savedProfile = loadProfilePreview(session);
    const mock = buildGeneratedContent(session, brief, contentType, savedProfile);
    const id = `gen-${Date.now()}`;
    setGenerated({
      ...mock,
      id,
      createdAt: "Just now",
    });
    setSavedGeneratedId(null);
    setGenerating(false);
  }

  function saveDraft() {
    if (!generated || savedGeneratedId === generated.id) return;

    const draftId = `draft-${Date.now()}`;
    const draft: GeneratedContent = {
      ...generated,
      id: draftId,
      createdAt: "Just now",
    };

    setDrafts((d) => [draft, ...d]);
    setSavedGeneratedId(generated.id);
    setHighlightDraftId(draftId);
    setSavedNotice(true);

    window.setTimeout(() => setSavedNotice(false), 3000);
    window.setTimeout(() => setHighlightDraftId(null), 4000);

    draftsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Marketing Agent"
        description="Create social posts, WhatsApp broadcasts, flyer copy, and email promos — powered by AI for your brand voice."
        action={
          <button
            type="button"
            onClick={generate}
            disabled={generating || !brief.topic.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate content
          </button>
        }
      />

      {savedNotice && (
        <div className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm font-medium text-primary">
          Draft saved to your library.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Megaphone, label: "Campaigns this month", value: "8" },
          { icon: TrendingUp, label: "Est. reach", value: "2.4k" },
          { icon: Calendar, label: "Scheduled posts", value: "3" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <stat.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
                  className={`rounded-xl border p-3 text-left transition ${
                    contentType === type.id
                      ? "border-primary bg-primary-light"
                      : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      contentType === type.id ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {type.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{type.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/30 hover:bg-primary-light/50"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <section className="min-h-[320px] rounded-2xl border border-border bg-card p-5 shadow-sm">
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
              />
            )}
            {!generating && !generated && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background py-16 text-center">
                <Sparkles className="h-10 w-10 text-primary/40" />
                <p className="mt-4 font-medium text-foreground">No content yet</p>
                <p className="mt-1 max-w-sm text-sm text-muted">
                  Fill in your campaign brief and click Generate content to create
                  marketing copy for your business.
                </p>
              </div>
            )}
          </section>

          <section
            ref={draftsSectionRef}
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Saved drafts</h2>
              <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                {drafts.length} {drafts.length === 1 ? "item" : "items"}
              </span>
            </div>
            {drafts.length === 0 ? (
              <p className="text-sm text-muted">Saved drafts will appear here.</p>
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
    </div>
  );
}
