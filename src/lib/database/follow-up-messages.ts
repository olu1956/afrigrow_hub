import type { FollowUpType } from "@/lib/crm-data";

export type FollowUpMessageStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "cancelled"
  | "failed";

export type FollowUpMessage = {
  id: string;
  user_id: string;
  lead_id: string;
  channel: FollowUpType;
  message: string;
  status: FollowUpMessageStatus;
  scheduled_at: string | null;
  created_at: string;
};

export type FollowUpMessageInsert = Pick<
  FollowUpMessage,
  "user_id" | "lead_id" | "channel"
> &
  Partial<Pick<FollowUpMessage, "message" | "status" | "scheduled_at">>;

export type FollowUpMessageUpdate = Partial<
  Pick<FollowUpMessage, "channel" | "message" | "status" | "scheduled_at">
>;

export const FOLLOW_UP_MESSAGES_TABLE = "follow_up_messages" as const;

export const FOLLOW_UP_MESSAGE_STATUSES: FollowUpMessageStatus[] = [
  "draft",
  "scheduled",
  "sent",
  "cancelled",
  "failed",
];

export const FOLLOW_UP_MESSAGE_CHANNELS: FollowUpType[] = [
  "call",
  "whatsapp",
  "email",
  "visit",
];
