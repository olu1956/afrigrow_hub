import type { FollowUpMessage } from "@/lib/database/follow-up-messages";
import type { FollowUp } from "@/lib/crm-data";
import { formatRelativeCreatedAt } from "@/lib/crm/format-dates";

export function followUpMessageToTimelineItem(row: FollowUpMessage): FollowUp {
  const timestamp = row.scheduled_at ?? row.created_at;

  return {
    id: row.id,
    type: row.channel,
    note: row.message,
    date: formatRelativeCreatedAt(timestamp),
    completed: row.status === "sent",
  };
}

export function groupMessagesByLeadId(
  messages: FollowUpMessage[],
): Map<string, FollowUpMessage[]> {
  const grouped = new Map<string, FollowUpMessage[]>();

  for (const message of messages) {
    const existing = grouped.get(message.lead_id) ?? [];
    existing.push(message);
    grouped.set(message.lead_id, existing);
  }

  return grouped;
}

export function messagesToFollowUps(messages: FollowUpMessage[]): FollowUp[] {
  return messages.map(followUpMessageToTimelineItem);
}
