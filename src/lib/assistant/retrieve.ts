import { assistantKnowledge } from "@/lib/assistant/knowledge";
import type { KnowledgeItem } from "@/lib/assistant/types";

/** Words that appear on almost every page. They must not decide the match by themselves. */
const GENERIC_TOKENS = new Set([
  "afrigrow",
  "hub",
  "business",
  "businesses",
  "member",
  "members",
  "sme",
  "smes",
  "platform",
]);

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "and",
  "or",
  "for",
  "in",
  "on",
  "is",
  "my",
  "i",
  "we",
  "do",
  "how",
  "what",
  "can",
  "you",
  "your",
  "me",
  "with",
  "about",
  "it",
  "this",
  "that",
  "are",
  "be",
  "does",
  "did",
  "our",
  "us",
  "please",
  "tell",
  "from",
]);

export type ScoredKnowledge = KnowledgeItem & { score: number };

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9%+ ]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/** Keyword overlap against the starter excerpts. No network and no model. */
export function retrieveKnowledge(query: string, limit = 3): ScoredKnowledge[] {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return [];

  const distinctive = queryTokens.filter((token) => !GENERIC_TOKENS.has(token));
  const scoringTokens = distinctive.length > 0 ? distinctive : queryTokens;

  const ranked = assistantKnowledge
    .map((item) => {
      const titleTokens = new Set(tokens(`${item.title} ${item.topics.join(" ")}`));
      const bodyTokens = new Set(tokens(item.body));
      let score = 0;
      for (const token of scoringTokens) {
        if (titleTokens.has(token)) score += 3;
        else if (bodyTokens.has(token)) score += 1;
      }
      return { ...item, score };
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]?.score ?? 0;
  return ranked.filter((item) => item.score >= best - 1).slice(0, limit);
}
