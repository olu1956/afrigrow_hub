import {
  Building2,
  Handshake,
  Megaphone,
  MessageSquare,
  Store,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type DemoStepSlug =
  | "profile"
  | "directory"
  | "marketing"
  | "matching"
  | "funding"
  | "crm";

export type DemoStep = {
  slug: DemoStepSlug;
  title: string;
  shortLabel: string;
  message: string;
  caption: string;
  icon: LucideIcon;
};

export const DEMO_STEPS: DemoStep[] = [
  {
    slug: "profile",
    title: "Business profile",
    shortLabel: "Profile",
    message: "This is how buyers find you",
    caption:
      "Complete your profile so you look professional. Reach 40% strength and you appear in the Directory. The Verified badge is added after AfriGrow checks the business.",
    icon: Building2,
  },
  {
    slug: "directory",
    title: "Business Directory",
    shortLabel: "Directory",
    message: "You appear here after 40% profile strength",
    caption:
      "Members browse real businesses across Africa. Verified listings have been checked by AfriGrow. Unverified listings are still visible — the badge tells people the difference.",
    icon: Store,
  },
  {
    slug: "marketing",
    title: "Marketing Agent",
    shortLabel: "Marketing",
    message: "Create a promo in minutes",
    caption:
      "Describe a sale or event and the Marketing Agent drafts WhatsApp and social posts in your brand voice. Sign in to generate and save your own.",
    icon: Megaphone,
  },
  {
    slug: "matching",
    title: "Matching Marketplace",
    shortLabel: "Matching",
    message: "We introduce you to the right businesses",
    caption:
      "See buyers, suppliers, and partners that fit your category and location. Enquiries stay behind a free account so conversations are with real members.",
    icon: Handshake,
  },
  {
    slug: "funding",
    title: "Finance & Funding",
    shortLabel: "Funding",
    message: "Get funding-ready — not a loan form",
    caption:
      "Track a readiness checklist and browse programmes that match your country and stage. AfriGrow prepares you; funders make the decision.",
    icon: Wallet,
  },
  {
    slug: "crm",
    title: "Customer Follow-Up CRM",
    shortLabel: "CRM",
    message: "Never lose a lead from a meeting",
    caption:
      "Keep contacts, notes, and follow-up dates in one place. After a training session or a marketplace intro, this is where the conversation lives.",
    icon: MessageSquare,
  },
];

export function getDemoStep(slug: string): DemoStep | undefined {
  return DEMO_STEPS.find((step) => step.slug === slug);
}

export function getAdjacentDemoSteps(slug: DemoStepSlug) {
  const index = DEMO_STEPS.findIndex((step) => step.slug === slug);
  return {
    index,
    prev: index > 0 ? DEMO_STEPS[index - 1] : null,
    next: index < DEMO_STEPS.length - 1 ? DEMO_STEPS[index + 1] : null,
  };
}
