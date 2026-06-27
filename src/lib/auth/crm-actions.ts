"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { groupMessagesByLeadId } from "@/lib/crm/follow-up-message-mapper";
import {
  countDueLeads,
  leadToContact,
} from "@/lib/crm/lead-mapper";
import { defaultNextFollowUpDate } from "@/lib/crm/format-dates";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import {
  FOLLOW_UP_MESSAGES_TABLE,
  type FollowUpMessage,
  type FollowUpMessageStatus,
} from "@/lib/database/follow-up-messages";
import {
  LEADS_TABLE,
  type Lead,
  type LeadStatus,
} from "@/lib/database/leads";
import type { Contact, FollowUpType } from "@/lib/crm-data";
import { createClient } from "@/lib/supabase/server";

export type CrmActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type LeadsResult = CrmActionResult & {
  contacts?: Contact[];
  stats?: {
    total: number;
    due: number;
    customers: number;
  };
};

export type LeadMutationResult = CrmActionResult & {
  contact?: Contact;
};

async function getUserBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ businessId: string | null; error?: string }> {
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { businessId: null, error: error.message };
  }

  if (!data?.id) {
    return { businessId: null, error: "Business profile not found. Complete your profile first." };
  }

  return { businessId: data.id };
}

function isMissingLeadsTableError(message: string): boolean {
  return message.includes("leads") && !message.includes("follow_up_messages");
}

function isMissingFollowUpMessagesTableError(message: string): boolean {
  return message.includes("follow_up_messages");
}

function formatCrmDbError(message: string): string {
  if (isMissingLeadsTableError(message)) {
    return "Run migration 20260620210000_create_leads.sql in Supabase SQL Editor, then refresh this page.";
  }

  if (isMissingFollowUpMessagesTableError(message)) {
    return "Run migration 20260620220000_create_follow_up_messages.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

async function fetchLeadMessages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ messages: FollowUpMessage[]; warning?: string }> {
  const { data, error } = await supabase
    .from(FOLLOW_UP_MESSAGES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingFollowUpMessagesTableError(error.message)) {
      return { messages: [], warning: formatCrmDbError(error.message) };
    }

    throw new Error(error.message);
  }

  return { messages: (data ?? []) as FollowUpMessage[] };
}

async function buildContactForLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  lead: Lead,
  groupedMessages?: Map<string, FollowUpMessage[]>,
): Promise<Contact> {
  let messages = groupedMessages?.get(lead.id);

  if (!messages) {
    const result = await fetchLeadMessages(supabase, userId);
    messages = result.messages.filter((item) => item.lead_id === lead.id);
  }

  return leadToContact(lead, messages);
}

export async function getLeadsAction(): Promise<LeadsResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, contacts: [], stats: { total: 0, due: 0, customers: 0 } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingLeadsTableError(error.message)) {
      return {
        ok: true,
        contacts: [],
        stats: { total: 0, due: 0, customers: 0 },
        warning: formatCrmDbError(error.message),
      };
    }

    return { ok: false, error: error.message };
  }

  const rows = (data ?? []) as Lead[];
  let warning: string | undefined;

  let groupedMessages = new Map<string, FollowUpMessage[]>();
  try {
    const messageResult = await fetchLeadMessages(supabase, user.id);
    warning = messageResult.warning;
    groupedMessages = groupMessagesByLeadId(messageResult.messages);
  } catch (messageError) {
    return {
      ok: false,
      error: messageError instanceof Error ? messageError.message : "Could not load follow-ups.",
    };
  }

  const contacts = rows.map((row) => leadToContact(row, groupedMessages.get(row.id) ?? []));

  return {
    ok: true,
    contacts,
    stats: {
      total: rows.length,
      due: countDueLeads(rows),
      customers: rows.filter((row) => row.status === "customer").length,
    },
    warning,
  };
}

export async function createLeadAction(input: {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: LeadStatus;
  notes?: string;
  nextFollowUp?: string | null;
}): Promise<LeadMutationResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { businessId, error: businessError } = await getUserBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: businessError };
  }

  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .insert({
      user_id: user.id,
      business_id: businessId,
      name,
      email: input.email?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      source: input.source?.trim() || "Manual entry",
      status: input.status ?? "lead",
      notes: input.notes?.trim() ?? "",
      next_follow_up: input.nextFollowUp ?? defaultNextFollowUpDate(0),
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatCrmDbError(error.message) };
  }

  revalidatePath("/dashboard/crm");

  return {
    ok: true,
    contact: await buildContactForLead(supabase, user.id, data as Lead),
  };
}

export async function updateLeadAction(input: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: LeadStatus;
  notes?: string;
  nextFollowUp?: string | null;
}): Promise<LeadMutationResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const updates: Record<string, string | null> = {};

  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.email !== undefined) updates.email = input.email.trim();
  if (input.phone !== undefined) updates.phone = input.phone.trim();
  if (input.source !== undefined) updates.source = input.source.trim() || "Manual entry";
  if (input.status !== undefined) updates.status = input.status;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.nextFollowUp !== undefined) updates.next_follow_up = input.nextFollowUp;

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatCrmDbError(error.message) };
  }

  revalidatePath("/dashboard/crm");

  return {
    ok: true,
    contact: await buildContactForLead(supabase, user.id, data as Lead),
  };
}

export async function logLeadFollowUpAction(input: {
  id: string;
  type: FollowUpType;
  note: string;
}): Promise<LeadMutationResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const note = input.note.trim();
  if (!note) {
    return { ok: false, error: "Follow-up note is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: lead, error: leadError } = await supabase
    .from(LEADS_TABLE)
    .select("*")
    .eq("id", input.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (leadError) {
    return { ok: false, error: formatCrmDbError(leadError.message) };
  }

  if (!lead) {
    return { ok: false, error: "Lead not found." };
  }

  const now = new Date().toISOString();
  const { error: messageError } = await supabase.from(FOLLOW_UP_MESSAGES_TABLE).insert({
    user_id: user.id,
    lead_id: input.id,
    channel: input.type,
    message: note,
    status: "sent",
    scheduled_at: now,
  });

  if (messageError) {
    return { ok: false, error: formatCrmDbError(messageError.message) };
  }

  const { data: updatedLead, error: updateError } = await supabase
    .from(LEADS_TABLE)
    .update({
      next_follow_up: defaultNextFollowUpDate(3),
    })
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError) {
    return { ok: false, error: formatCrmDbError(updateError.message) };
  }

  revalidatePath("/dashboard/crm");

  return {
    ok: true,
    contact: await buildContactForLead(supabase, user.id, updatedLead as Lead),
  };
}

export async function toggleLeadFollowUpAction(input: {
  id: string;
  followUpId: string;
  completed: boolean;
}): Promise<LeadMutationResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const status: FollowUpMessageStatus = input.completed ? "sent" : "cancelled";

  const { error: messageError } = await supabase
    .from(FOLLOW_UP_MESSAGES_TABLE)
    .update({ status })
    .eq("id", input.followUpId)
    .eq("lead_id", input.id)
    .eq("user_id", user.id);

  if (messageError) {
    return { ok: false, error: formatCrmDbError(messageError.message) };
  }

  const { data: lead, error: leadError } = await supabase
    .from(LEADS_TABLE)
    .select("*")
    .eq("id", input.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (leadError) {
    return { ok: false, error: formatCrmDbError(leadError.message) };
  }

  if (!lead) {
    return { ok: false, error: "Lead not found." };
  }

  revalidatePath("/dashboard/crm");

  return {
    ok: true,
    contact: await buildContactForLead(supabase, user.id, lead as Lead),
  };
}

export async function scheduleFollowUpMessageAction(input: {
  leadId: string;
  channel: FollowUpType;
  message: string;
  scheduledAt: string;
}): Promise<CrmActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const message = input.message.trim();
  if (!message) {
    return { ok: false, error: "Message is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { error } = await supabase.from(FOLLOW_UP_MESSAGES_TABLE).insert({
    user_id: user.id,
    lead_id: input.leadId,
    channel: input.channel,
    message,
    status: "scheduled",
    scheduled_at: input.scheduledAt,
  });

  if (error) {
    return { ok: false, error: formatCrmDbError(error.message) };
  }

  const { error: leadError } = await supabase
    .from(LEADS_TABLE)
    .update({ next_follow_up: input.scheduledAt })
    .eq("id", input.leadId)
    .eq("user_id", user.id);

  if (leadError) {
    return { ok: false, error: formatCrmDbError(leadError.message) };
  }

  revalidatePath("/dashboard/crm");

  return { ok: true };
}

export async function deleteLeadAction(id: string): Promise<CrmActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { error } = await supabase.from(LEADS_TABLE).delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return { ok: false, error: formatCrmDbError(error.message) };
  }

  revalidatePath("/dashboard/crm");

  return { ok: true };
}
