import { howItWorksAudiences, howItWorksSteps } from "@/components/landing/HowItWorks";
import { DEMO_STEPS } from "@/lib/demo/tour";
import type { KnowledgeItem } from "@/lib/assistant/types";

const review = {
  region: "all" as const,
  owner: "AfriGrow Hub",
  approvedOn: "2026-10-21",
  reviewBy: "2027-01-21",
};

const demoStops = DEMO_STEPS.map(
  (step) => `${step.title}: ${step.message}. ${step.caption}`,
).join(" ");

/**
 * Public pages whose wording already lives in this repo.
 * Private member records are not included.
 */
export const publishedPageKnowledge: KnowledgeItem[] = [
  {
    id: "product-demo",
    title: "Product tour demo",
    body: `Yes. AfriGrow has a demo page. Open it to walk the product before you sign in. Nothing you click there is saved, and the listings are sample data so you can see Verified and Unverified businesses. There are six stops. ${demoStops} Join free when you want to use AfriGrow for your own business.`,
    sourceLabel: "See how AfriGrow Hub works",
    sourceHref: "/demo",
    topics: ["demo", "tour", "walkthrough", "preview", "sample"],
    ...review,
  },
  {
    id: "how-it-works",
    title: "How the product works",
    body: `AfriGrow Hub is built for ${howItWorksAudiences.join(", ")}. The homepage describes three steps. ${howItWorksSteps
      .map((step, index) => `${index + 1}. ${step.title}: ${step.description}`)
      .join(" ")} The demo page is a two-minute tour of the same product if you want to see it before you create an account.`,
    sourceLabel: "How it works",
    sourceHref: "/#how-it-works",
    topics: ["works", "work", "steps", "step", "start", "begin"],
    ...review,
  },
  {
    id: "account-access",
    title: "Sign up, log in, and password reset",
    body: "Create a free founding-member account on the sign-up page. No credit card is required during early access. Members who already have an account sign in on the log-in page. If you forget the password, the reset page lets you choose a new one. The demo tour does not need an account.",
    sourceLabel: "Sign up",
    sourceHref: "/signup",
    topics: ["signup", "register", "login", "password", "forgot", "account"],
    ...review,
  },
];
