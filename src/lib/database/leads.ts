export type LeadStatus = "lead" | "customer" | "inactive";

export type Lead = {
  id: string;
  user_id: string;
  business_id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  notes: string;
  next_follow_up: string | null;
  created_at: string;
};

export type LeadInsert = Pick<Lead, "user_id" | "business_id" | "name"> &
  Partial<
    Pick<
      Lead,
      "email" | "phone" | "source" | "status" | "notes" | "next_follow_up"
    >
  >;

export type LeadUpdate = Partial<
  Pick<
    Lead,
    "name" | "email" | "phone" | "source" | "status" | "notes" | "next_follow_up"
  >
>;

export const LEADS_TABLE = "leads" as const;

export const LEAD_STATUSES: LeadStatus[] = ["lead", "customer", "inactive"];
