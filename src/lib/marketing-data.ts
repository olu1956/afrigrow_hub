import type { SessionPreview } from "@/lib/session-preview";
import type { BusinessProfile } from "@/lib/profile-data";
import { buildMarketingProfileContext } from "@/lib/profile-data";

export type ContentType = "social" | "whatsapp" | "flyer" | "email";

export type CampaignBrief = {
  topic: string;
  audience: string;
  tone: string;
  goal: string;
  platform: string;
};

export const contentTypes: { id: ContentType; label: string; description: string }[] = [
  { id: "social", label: "Social post", description: "Instagram, Facebook, X" },
  { id: "whatsapp", label: "WhatsApp", description: "Broadcast & status" },
  { id: "flyer", label: "Flyer copy", description: "Print & digital posters" },
  { id: "email", label: "Email", description: "Newsletter & promos" },
];

export const toneOptions = [
  "Friendly & vibrant",
  "Professional",
  "Urgent / sale-focused",
  "Luxury & premium",
  "Community-focused",
];

export const goalOptions = [
  "Drive store visits",
  "Increase online orders",
  "Promote new product",
  "Build brand awareness",
  "Event promotion",
];

export const platformOptions = [
  "Instagram",
  "Facebook",
  "WhatsApp",
  "X (Twitter)",
  "LinkedIn",
  "All platforms",
];

export type GeneratedContent = {
  id: string;
  type: ContentType;
  title: string;
  body: string;
  hashtags?: string;
  platform?: string;
  createdAt: string;
  status?: "draft" | "generated" | "scheduled" | "published" | "archived";
};

const contentTypeShortLabels: Record<ContentType, string> = {
  social: "Social",
  whatsapp: "WhatsApp",
  flyer: "Flyer",
  email: "Email",
};

export function getContentTypeShortLabel(type: ContentType): string {
  return contentTypeShortLabels[type];
}

export function formatCampaignMeta(
  platform?: string,
  type?: ContentType,
): string | undefined {
  const typeLabel = type ? getContentTypeShortLabel(type) : undefined;
  const trimmedPlatform = platform?.trim();

  if (trimmedPlatform && typeLabel) return `${trimmedPlatform} · ${typeLabel}`;
  return trimmedPlatform || typeLabel;
}

export type QuickTemplate = {
  id: string;
  label: string;
  topic: string;
};

function hashtagFromName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "");
}

export function buildDefaultBrief(
  session: SessionPreview,
  profile?: BusinessProfile,
): CampaignBrief {
  const { businessName } = buildMarketingProfileContext(session, profile);

  return {
    topic: `Highlight the impact and services of ${businessName}`,
    audience: `Communities, partners, and supporters connected to ${businessName}`,
    tone: "Community-focused",
    goal: "Build brand awareness",
    platform: "LinkedIn",
  };
}

export function buildQuickTemplates(
  session: SessionPreview,
  profile?: BusinessProfile,
): QuickTemplate[] {
  const { businessName } = buildMarketingProfileContext(session, profile);

  return [
    {
      id: "launch",
      label: "Programme launch",
      topic: `Introducing a new initiative from ${businessName}`,
    },
    {
      id: "event",
      label: "Event promo",
      topic: `Upcoming event hosted by ${businessName}`,
    },
    {
      id: "partnership",
      label: "Partnership",
      topic: `Partner with ${businessName} — collaboration opportunity`,
    },
    {
      id: "impact",
      label: "Impact story",
      topic: `How ${businessName} is making a difference`,
    },
  ];
}

export function buildGeneratedContent(
  session: SessionPreview,
  brief: CampaignBrief,
  type: ContentType,
  profile?: BusinessProfile,
): Omit<GeneratedContent, "id" | "createdAt"> {
  const { businessName, owner, location, phone } = buildMarketingProfileContext(
    session,
    profile,
  );
  const tag = hashtagFromName(businessName);
  const locationLine = location || "See our profile for location details";
  const contactLine = phone
    ? `📞 ${phone} · Contact ${owner} for enquiries`
    : `📞 Contact ${owner} for enquiries`;

  switch (type) {
    case "social":
      return {
        type: "social",
        title: `${brief.topic} — ${brief.platform}`,
        body: `${brief.topic}

${businessName} — ${brief.goal.toLowerCase()}.

We'd love your support. Whether you're a partner, participant, or supporter, there's a place for you in what we're building.

📍 ${locationLine}
${contactLine}

Thank you for being part of our community.`,
        hashtags: `#${tag} #CommunityImpact #AfricanBusiness #${brief.platform.replace(/\s+/g, "")}`,
      };
    case "whatsapp":
      return {
        type: "whatsapp",
        title: `WhatsApp broadcast — ${businessName}`,
        body: `Hi {{name}} 👋

This is ${businessName}. ${brief.topic}

We're reaching out to ${brief.audience.toLowerCase()}.

If you'd like to learn more, reply *YES* and we'll share details.

Thank you for your support 🙏
— ${owner}, ${businessName}`,
      };
    case "flyer":
      return {
        type: "flyer",
        title: `Flyer copy — ${businessName}`,
        body: `${brief.topic.toUpperCase()}

${businessName}

${brief.goal}
Tone: ${brief.tone}

📍 ${locationLine}
${contactLine}

Join us. Spread the word. Make an impact.`,
      };
    case "email":
      return {
        type: "email",
        title: `Email — ${businessName}`,
        body: `Subject: ${brief.topic} — from ${businessName}

Hi there,

${brief.topic}

At ${businessName}, we work with ${brief.audience.toLowerCase()}. ${brief.goal}.

We'd welcome the chance to tell you more about what we do and how you can get involved.

Warm regards,
${owner}
${businessName}
${locationLine}`,
      };
  }
}
