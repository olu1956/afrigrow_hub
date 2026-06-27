import type { BusinessGuideInput, GuideTopic } from "@/lib/database/business-guides";

export type GuideSeed = BusinessGuideInput & {
  isFeatured: boolean;
  status: "published";
};

export const guideTopicLabels: Record<GuideTopic, string> = {
  profile: "Profile",
  marketing: "Marketing",
  crm: "CRM",
  matching: "Matching",
  funding: "Funding",
  pricing: "Pricing",
  growth: "Growth",
  general: "General",
};

export const guideTopicFilters: { value: GuideTopic | "all"; label: string }[] = [
  { value: "all", label: "All topics" },
  { value: "profile", label: "Profile" },
  { value: "marketing", label: "Marketing" },
  { value: "crm", label: "CRM" },
  { value: "matching", label: "Matching" },
  { value: "funding", label: "Funding" },
  { value: "pricing", label: "Pricing" },
  { value: "growth", label: "Growth" },
];

export const seedBusinessGuides: GuideSeed[] = [
  {
    slug: "reach-40-percent-profile-directory",
    title: "Reach 40% profile strength to appear in the directory",
    summary:
      "A complete profile helps buyers trust you — and unlocks your free listing in the AfriGrow Business Directory.",
    topic: "profile",
    author: "AfriGrow Hub",
    readTimeMinutes: 6,
    isFeatured: true,
    status: "published",
    linkedAgentHref: "/dashboard/profile",
    linkedAgentLabel: "Open Profile Agent",
    publishedAt: "2026-06-01T09:00:00.000Z",
    body: `## Why 40% matters

AfriGrow Hub uses a profile strength score to show how complete and credible your business looks. At **40% or higher**, your business can appear in the public directory where other members discover partners and suppliers.

## Quick wins that move the score

- Add your **business name**, **category**, **city**, and **country**
- Write a **tagline** and a bio of at least 80 characters
- List at least **two services** you offer
- Add **phone**, **email**, and **WhatsApp**
- Upload a **logo** when you have one

## Save to go live

Your score updates as you edit, but the directory reads your **saved** profile. After you hit 40%, click **Save profile** in the Profile Agent.

## What to do next

Check the directory to see how your listing looks, then strengthen your profile toward 80% for a featured placement when you have a logo.`,
  },
  {
    slug: "first-marketing-campaign",
    title: "Create your first marketing campaign",
    summary:
      "Turn a simple promotion into saved posts you can reuse — without starting from a blank page every time.",
    topic: "marketing",
    author: "AfriGrow Hub",
    readTimeMinutes: 5,
    isFeatured: true,
    status: "published",
    linkedAgentHref: "/dashboard/marketing",
    linkedAgentLabel: "Open Marketing Agent",
    publishedAt: "2026-06-05T09:00:00.000Z",
    body: `## Start with one clear goal

Pick a single outcome: a weekend sale, a new service launch, or a seasonal promotion. One message is easier to write and easier for customers to remember.

## Use what you already have

Your business profile feeds the Marketing Agent — name, location, services, and contact details. Complete your profile first so generated copy sounds like you.

## Draft, review, then save

Generate a short post or WhatsApp message, edit anything that feels off-brand, and **save the campaign** in your dashboard. Saved campaigns count toward your real usage stats.

## Keep it honest

Early access means you are building your library of content — not blasting fake reach numbers. Focus on messages you would actually send to real customers.`,
  },
  {
    slug: "crm-follow-up-basics",
    title: "Follow up without losing leads",
    summary:
      "A simple CRM habit so enquiries and conversations do not go cold after the first contact.",
    topic: "crm",
    author: "AfriGrow Hub",
    readTimeMinutes: 5,
    isFeatured: true,
    status: "published",
    linkedAgentHref: "/dashboard/crm",
    linkedAgentLabel: "Open CRM",
    publishedAt: "2026-06-08T09:00:00.000Z",
    body: `## Capture every enquiry

When someone shows interest — by phone, WhatsApp, email, or an event — add them as a **contact** in the CRM. Include how they found you and what they asked about.

## Schedule the next touch

Set a follow-up date before you close the tab. Most small businesses lose sales simply because nobody called back within 48 hours.

## Log what happened

Use follow-up notes or messages in the timeline so you remember the last conversation. Your future self (or a team member) will thank you.

## Review due follow-ups weekly

Open the CRM each week and work through contacts with follow-ups due. Consistency beats perfect scripts.`,
  },
  {
    slug: "send-marketplace-enquiry",
    title: "Send your first marketplace enquiry",
    summary:
      "How to find suppliers or buyers in the Matching Marketplace and start a real conversation.",
    topic: "matching",
    author: "AfriGrow Hub",
    readTimeMinutes: 4,
    isFeatured: false,
    status: "published",
    linkedAgentHref: "/dashboard/matching",
    linkedAgentLabel: "Open Matching",
    publishedAt: "2026-06-10T09:00:00.000Z",
    body: `## Know what you need

Before you browse, write one sentence: what you are looking for (supplier, buyer, partner) and in which category or region.

## Browse live listings first

The marketplace shows **live** AfriGrow member profiles where available. Sample listings are marked — they are placeholders until more businesses join.

## Send a specific enquiry

Generic messages get ignored. Mention your business, what you need, quantities or timelines, and how you prefer to be contacted.

## Follow up in CRM

When someone responds, add them to CRM so the opportunity does not disappear after one message.`,
  },
  {
    slug: "funding-readiness-checklist",
    title: "Build your funding readiness checklist",
    summary:
      "Prepare your business before you apply — grants and programmes expect evidence, not just enthusiasm.",
    topic: "funding",
    author: "AfriGrow Hub",
    readTimeMinutes: 7,
    isFeatured: true,
    status: "published",
    linkedAgentHref: "/dashboard/funding",
    linkedAgentLabel: "Open Finance Agent",
    publishedAt: "2026-06-12T09:00:00.000Z",
    body: `## Readiness is not approval

AfriGrow Hub helps you **find** programmes and **prepare** — it does not guarantee funding. Lenders and grant bodies make their own decisions.

## Work through the checklist honestly

In the Finance Agent, save your business stage, purpose, and completed checklist items. Your readiness score reflects what you have actually prepared — not wishful thinking.

## Gather basics first

Most funders expect: registered business details, bank records, a simple plan, and proof you understand how the money will be used.

## Apply via official links

When a programme fits, use the **external apply link** on the programme card. Keep copies of what you submitted.

## Refresh every quarter

Update your checklist when your revenue, team, or plans change — stale applications get rejected fast.`,
  },
  {
    slug: "price-services-with-confidence",
    title: "Price your services with confidence",
    summary:
      "A practical way to set prices that cover costs and reflect the value you deliver.",
    topic: "pricing",
    author: "AfriGrow Hub",
    readTimeMinutes: 6,
    isFeatured: false,
    status: "published",
    linkedAgentHref: "/dashboard/growth",
    linkedAgentLabel: "Open Growth Agent",
    publishedAt: "2026-06-14T09:00:00.000Z",
    body: `## Know your floor

List direct costs: materials, travel, staff time, platform fees. Your price must cover these before you earn anything.

## Compare without copying

Look at what others charge for **similar scope**, not just the same industry. A cheap quote that loses money helps nobody.

## Package instead of discounting

Bundle deliverables into clear packages (Basic / Standard / Premium) so customers compare value, not hourly rates.

## Use the Growth Agent

If pricing is a pain point, run a growth diagnosis — the action plan can include steps to test new prices with existing customers.

## Review twice a year

Costs rise. Schedule a pricing review every six months instead of panic-discounting when cash flow tightens.`,
  },
  {
    slug: "diagnose-growth-blocker",
    title: "Diagnose your biggest growth blocker",
    summary:
      "Use a structured pain-point review to focus on the one constraint holding your business back.",
    topic: "growth",
    author: "AfriGrow Hub",
    readTimeMinutes: 5,
    isFeatured: false,
    status: "published",
    linkedAgentHref: "/dashboard/growth",
    linkedAgentLabel: "Open Growth Agent",
    publishedAt: "2026-06-16T09:00:00.000Z",
    body: `## One blocker at a time

Visibility, sales, pricing, cash flow, and operations all matter — but fixing everything at once spreads you too thin. Pick the **one** pain point hurting you most this month.

## Run an honest diagnosis

In the Growth Agent, select the challenge that matches your reality. The plan works best when you answer from evidence, not hope.

## Turn actions into calendar items

Each recommendation should become a dated task: update your profile, call three leads, revise a package, or review expenses.

## Measure in four weeks

Revisit the same pain point after a month. If the score improved, keep going. If not, adjust the plan or ask for help from a mentor or partner.`,
  },
  {
    slug: "professional-client-invoices",
    title: "Send professional invoices to clients",
    summary:
      "Use AfriGrow billing tools to quote and invoice clients clearly — separate from your AfriGrow subscription.",
    topic: "general",
    author: "AfriGrow Hub",
    readTimeMinutes: 4,
    isFeatured: false,
    status: "published",
    linkedAgentHref: "/dashboard/billing",
    linkedAgentLabel: "Open Billing",
    publishedAt: "2026-06-18T09:00:00.000Z",
    body: `## Two different "billing" ideas

Your **AfriGrow plan** is what you pay us (early access — no card on file yet). **Client invoices and quotations** are documents you send to **your** customers for your work.

## Quote before you invoice

For new clients, send a quotation with scope and price. When they agree, convert the work into an invoice with clear payment terms.

## Keep records from day one

Even as a sole trader, saved invoices help with tax, funding applications, and disputes. Use the billing section to store real documents — not demo data.

## Match your brand

Add your logo and business details from your profile so PDFs look professional when clients receive them.`,
  },
];

export function getStaticGuideBySlug(slug: string) {
  return seedBusinessGuides.find((guide) => guide.slug === slug) ?? null;
}
