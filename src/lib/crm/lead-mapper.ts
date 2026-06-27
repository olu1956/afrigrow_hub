import type { Lead } from "@/lib/database/leads";
import type { FollowUpMessage } from "@/lib/database/follow-up-messages";
import { messagesToFollowUps } from "@/lib/crm/follow-up-message-mapper";
import {
  formatRelativeCreatedAt,
  formatRelativeFollowUp,
  isFollowUpDueDate,
} from "@/lib/crm/format-dates";
import type { Contact, ContactStatus, FollowUp, FollowUpType } from "@/lib/crm-data";

const FOLLOW_UPS_MARKER = "\n\n[AFRIGROW_FOLLOWUPS]\n";

const followUpTypes: FollowUpType[] = ["call", "whatsapp", "email", "visit"];

export {
  defaultNextFollowUpDate,
  formatRelativeCreatedAt,
  formatRelativeFollowUp,
  isFollowUpDueDate,
} from "@/lib/crm/format-dates";

function parseFollowUpsFromNotes(notes: string): FollowUp[] {
  const markerIndex = notes.indexOf(FOLLOW_UPS_MARKER);
  if (markerIndex === -1) return [];

  const payload = notes.slice(markerIndex + FOLLOW_UPS_MARKER.length).trim();
  if (!payload) return [];

  try {
    const parsed = JSON.parse(payload) as FollowUp[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        followUpTypes.includes(item.type) &&
        typeof item.note === "string" &&
        typeof item.date === "string",
    );
  } catch {
    return [];
  }
}

export function extractUserNotes(notes: string): string {
  const markerIndex = notes.indexOf(FOLLOW_UPS_MARKER);
  if (markerIndex === -1) return notes.trim();
  return notes.slice(0, markerIndex).trim();
}

export function serializeNotesWithFollowUps(userNotes: string, followUps: FollowUp[]): string {
  const trimmedNotes = userNotes.trim();
  if (followUps.length === 0) return trimmedNotes;

  const payload = `${FOLLOW_UPS_MARKER}${JSON.stringify(followUps)}`;
  return trimmedNotes ? `${trimmedNotes}${payload}` : payload.trimStart();
}

export function appendFollowUpToNotes(
  notes: string,
  followUp: Omit<FollowUp, "id"> & { id?: string },
): string {
  const userNotes = extractUserNotes(notes);
  const existing = parseFollowUpsFromNotes(notes);
  const entry: FollowUp = {
    id: followUp.id ?? `f-${Date.now()}`,
    type: followUp.type,
    note: followUp.note,
    date: followUp.date,
    completed: followUp.completed,
  };

  return serializeNotesWithFollowUps(userNotes, [entry, ...existing]);
}

export function toggleFollowUpInNotes(
  notes: string,
  followUpId: string,
  completed: boolean,
): string {
  const userNotes = extractUserNotes(notes);
  const followUps = parseFollowUpsFromNotes(notes).map((item) =>
    item.id === followUpId ? { ...item, completed } : item,
  );

  return serializeNotesWithFollowUps(userNotes, followUps);
}

export function parseLeadFollowUps(notes: string): FollowUp[] {
  return parseFollowUpsFromNotes(notes);
}

export function leadToContact(row: Lead, messages: FollowUpMessage[] = []): Contact {
  const followUps = messages.length > 0 ? messagesToFollowUps(messages) : parseFollowUpsFromNotes(row.notes);
  const userNotes = extractUserNotes(row.notes);
  const lastFollowUp = followUps[0];

  return {
    id: row.id,
    name: row.name,
    business: row.source,
    phone: row.phone,
    email: row.email,
    status: row.status as ContactStatus,
    source: row.source,
    lastContact: lastFollowUp?.date ?? formatRelativeCreatedAt(row.created_at),
    nextFollowUp: formatRelativeFollowUp(row.next_follow_up),
    nextFollowUpType: lastFollowUp?.type ?? "whatsapp",
    notes: userNotes,
    followUps,
  };
}

export function countDueLeads(rows: Lead[]): number {
  return rows.filter((row) => isFollowUpDueDate(row.next_follow_up)).length;
}
