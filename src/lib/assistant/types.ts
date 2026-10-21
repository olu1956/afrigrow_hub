export type KnowledgeRegion = "all" | "depends-on-country";

/**
 * One reviewed snippet the assistant may quote.
 * `approvedOn` is the day AfriGrow accepted the wording. `reviewBy` is the next check.
 */
export type KnowledgeItem = {
  id: string;
  title: string;
  body: string;
  sourceLabel: string;
  sourceHref: string;
  region: KnowledgeRegion;
  owner: string;
  approvedOn: string | null;
  reviewBy: string | null;
  topics: string[];
};

export type ChatRole = "user" | "assistant";

export type ChatTurn = {
  role: ChatRole;
  content: string;
};

export type AnswerSource = {
  title: string;
  href: string;
};

export type AssistantAnswer = {
  reply: string;
  sources: AnswerSource[];
  /** True when the reply is limited to supplied excerpts. */
  grounded: boolean;
  providerUsed: boolean;
};
