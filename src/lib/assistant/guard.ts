import type { ChatTurn } from "@/lib/assistant/types";

const MAX_TURNS = 8;
const MAX_CHARS = 1200;

const PROMPT_THEFT =
  /\b(system prompt|developer message|ignore (all |any )?(previous|prior|above)|reveal your instructions|show (me )?your (rules|prompt)|api key|service role)\b/i;

const SECRET =
  /\b(password\s*(is|:)|passcode|sort code|account number|card number|cvv|iban|national insurance|ni number|bvn)\b/i;

const LONG_NUMBER = /\b(?:\d[ -]*?){13,19}\b/;

const HIGH_IMPACT =
  /\b(eligib|guarantee|will i (get|qualify)|am i entitled|legal advice|solicitor|lawsuit|sue\b|tax return|vat return|should i incorporate|regulated advice|comply with the law)\b/i;

const REGION_SENSITIVE =
  /\b(grant|funding|funders?|loan|tax|vat|eligib|scheme|company registration|register (my|a) (business|company)|hmrc|cac\b|companies house)\b/i;

const COUNTRY =
  /\b(uk|u\.k\.|united kingdom|britain|england|scotland|wales|northern ireland|london|nigeria|lagos|abuja|ghana|accra|kenya|nairobi|south africa|johannesburg|cape town|uganda|kampala|tanzania|rwanda|ethiopia|zambia|zimbabwe|cameroon|senegal|ivory coast|côte d'ivoire|sierra leone|gambia|benin|togo|uk-based|diaspora)\b/i;

export function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

export function parseTurns(input: unknown): ChatTurn[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_TURNS) return null;

  const turns: ChatTurn[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const cleaned = cleanText(content);
    if (!cleaned || cleaned.length > MAX_CHARS) return null;
    turns.push({ role, content: cleaned });
  }

  if (turns[turns.length - 1]?.role !== "user") return null;
  return turns;
}

export function looksLikePromptTheft(text: string): boolean {
  return PROMPT_THEFT.test(text);
}

export function looksLikeSecret(text: string): boolean {
  return SECRET.test(text) || LONG_NUMBER.test(text);
}

/** Remove details we should not forward to a model. */
export function redactSensitive(text: string): string {
  return text
    .replace(LONG_NUMBER, "[removed]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email removed]")
    .replace(/\+?\d[\d\s()-]{8,}\d/g, "[phone removed]");
}

export function needsCountry(text: string): boolean {
  if (COUNTRY.test(text)) return false;
  // Product questions about AfriGrow itself do not need a country first.
  if (/\bdoes afrigrow\b/i.test(text) && !/\b(i|me|my)\b/i.test(text)) return false;
  return REGION_SENSITIVE.test(text);
}

export function isHighImpact(text: string): boolean {
  return HIGH_IMPACT.test(text) || REGION_SENSITIVE.test(text);
}

export function userTextForRetrieval(turns: ChatTurn[]): string {
  const users = turns.filter((turn) => turn.role === "user");
  const latest = users[users.length - 1]?.content ?? "";
  const earlier = users
    .slice(0, -1)
    .slice(-2)
    .map((turn) => turn.content)
    .join("\n");
  const latestWordCount = latest.trim().split(/\s+/).filter(Boolean).length;
  // A short reply such as a country name still belongs to the previous question.
  if (earlier && latestWordCount > 0 && latestWordCount <= 4) {
    return `${earlier}\n${latest}`;
  }
  return latest;
}
