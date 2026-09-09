export const POST_TRAINING_PAGE_PATH = "/after-training";
export const POST_TRAINING_DASHBOARD_PATH = "/dashboard/next-steps";

export type PostTrainingStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export const postTrainingSteps: PostTrainingStep[] = [
  {
    id: "profile",
    title: "Complete your business profile",
    description:
      "Add your country, what you sell, and a short bio so the Hub can help you properly.",
    href: "/dashboard/profile",
    cta: "Open Profile Agent",
  },
  {
    id: "marketing",
    title: "Create one promo",
    description:
      "Use the Marketing Agent to draft one social post or WhatsApp message for this week.",
    href: "/dashboard/marketing",
    cta: "Open Marketing Agent",
  },
  {
    id: "funding",
    title: "Check funding for your country",
    description:
      "Open the Finance Agent, set your country, and see which programmes you may be eligible for.",
    href: "/dashboard/funding",
    cta: "Open Finance Agent",
  },
  {
    id: "crm",
    title: "Add 3–5 contacts in CRM",
    description:
      "Put real customers or partners in Follow-up CRM so leads do not stay in WhatsApp only.",
    href: "/dashboard/crm",
    cta: "Open CRM",
  },
  {
    id: "directory",
    title: "Get listed in the Directory",
    description:
      "Save a profile of 40% or more so other members can find your business.",
    href: "/dashboard/directory",
    cta: "Open Directory",
  },
];
