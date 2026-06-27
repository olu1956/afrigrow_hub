"use server";

import { revalidatePath } from "next/cache";
import { isPlatformAdminUser } from "@/lib/auth/admin-access";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import {
  mapEnterpriseEnquiry,
  serializeInterestedIn,
  type EnterpriseEnquiryView,
} from "@/lib/enterprise/enquiry-mapper";
import {
  ENTERPRISE_ENQUIRIES_TABLE,
  type EnterpriseEnquiry,
  type EnterpriseEnquirySource,
  type EnterpriseEnquiryStatus,
} from "@/lib/database/enterprise-enquiries";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type EnterpriseEnquiryActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type SubmitEnterpriseEnquiryResult = EnterpriseEnquiryActionResult & {
  enquiryId?: string;
};

export type EnterpriseEnquiriesResult = EnterpriseEnquiryActionResult & {
  enquiries?: EnterpriseEnquiryView[];
  stats?: {
    total: number;
    new: number;
    qualified: number;
  };
};

export type PlatformAdminResult = EnterpriseEnquiryActionResult & {
  isAdmin?: boolean;
  authEmail?: string;
};

function isMissingTableError(message: string): boolean {
  return (
    /relation ["']?public\.enterprise_enquiries["']? does not exist/i.test(message) ||
    /Could not find the table ['"]public\.enterprise_enquiries['"] in the schema cache/i.test(
      message,
    )
  );
}

function formatEnquiryDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "The inbound leads table is not set up yet. In Supabase → SQL Editor, run supabase/scripts/setup_inbound_leads.sql, then wait a few seconds and refresh this page.";
  }

  if (/enquiry_type|subject|website|schema cache/i.test(message)) {
    return "The inbound leads table needs an update. In Supabase → SQL Editor, run supabase/scripts/setup_inbound_leads.sql, then wait a few seconds and refresh this page.";
  }

  if (/violates check constraint.*enterprise_enquiries_source/i.test(message)) {
    return "The inbound leads table needs an update (source constraint). Run supabase/scripts/setup_inbound_leads.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

async function insertEnquiry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: Record<string, unknown>,
): Promise<SubmitEnterpriseEnquiryResult> {
  // Do not .select() after insert — anon users can insert but cannot read rows back (RLS).
  const { error } = await supabase.from(ENTERPRISE_ENQUIRIES_TABLE).insert(payload);

  if (error) {
    return { ok: false, error: formatEnquiryDbError(error.message) };
  }

  revalidatePath("/dashboard/admin/enquiries");

  return { ok: true };
}

export async function checkPlatformAdminAction(): Promise<PlatformAdminResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, isAdmin: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: true, isAdmin: false, authEmail: "" };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  return { ok: true, isAdmin, authEmail: user.email ?? "" };
}

export async function submitEnterpriseEnquiryAction(input: {
  name: string;
  email: string;
  phone?: string;
  companyName: string;
  teamSize: string;
  locations: string;
  interestedIn: string[];
  message: string;
  source?: EnterpriseEnquirySource;
}): Promise<SubmitEnterpriseEnquiryResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const companyName = input.companyName.trim();
  const message = input.message.trim();

  if (!name || !email || !companyName || !message) {
    return { ok: false, error: "Name, email, company, and message are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return insertEnquiry(supabase, {
    user_id: user?.id ?? null,
    name,
    email,
    phone: input.phone?.trim() ?? "",
    company_name: companyName,
    team_size: input.teamSize.trim(),
    locations: input.locations.trim(),
    interested_in: serializeInterestedIn(input.interestedIn),
    message,
    subject: "",
    website: "",
    enquiry_type: "enterprise",
    source: input.source ?? "contact",
  });
}

export async function submitContactMessageAction(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SubmitEnterpriseEnquiryResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name || !email || !subject || !message) {
    return { ok: false, error: "Name, email, subject, and message are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return insertEnquiry(supabase, {
    user_id: user?.id ?? null,
    name,
    email,
    phone: "",
    company_name: "",
    team_size: "",
    locations: "",
    interested_in: "",
    subject,
    message,
    website: "",
    enquiry_type: "contact",
    source: "contact",
  });
}

export async function submitPartnerApplicationAction(input: {
  companyName: string;
  contactName: string;
  email: string;
  website?: string;
  offer: string;
}): Promise<SubmitEnterpriseEnquiryResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const companyName = input.companyName.trim();
  const name = input.contactName.trim();
  const email = input.email.trim();
  const offer = input.offer.trim();
  const website = input.website?.trim() ?? "";

  if (!companyName || !name || !email || !offer) {
    return {
      ok: false,
      error: "Company name, contact name, email, and partnership offer are required.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return insertEnquiry(supabase, {
    user_id: user?.id ?? null,
    name,
    email,
    phone: "",
    company_name: companyName,
    team_size: "",
    locations: "",
    interested_in: "",
    subject: "",
    message: offer,
    website,
    enquiry_type: "partner",
    source: "partner",
  });
}

async function assertPlatformAdmin(): Promise<{
  ok: true;
  supabase: Awaited<ReturnType<typeof createClient>>;
} | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  if (!isAdmin) {
    return { ok: false, error: "You do not have access to this admin area." };
  }

  return { ok: true, supabase };
}

export async function getEnterpriseEnquiriesAction(): Promise<EnterpriseEnquiriesResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const adminClient = createAdminClient();
  const queryClient = adminClient ?? auth.supabase;

  const { data, error } = await queryClient
    .from(ENTERPRISE_ENQUIRIES_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: true,
        enquiries: [],
        stats: { total: 0, new: 0, qualified: 0 },
        warning: formatEnquiryDbError(error.message),
      };
    }

    return { ok: false, error: formatEnquiryDbError(error.message) };
  }

  const rows = (data ?? []) as EnterpriseEnquiry[];

  if (rows.length === 0 && !adminClient) {
    return {
      ok: true,
      enquiries: [],
      stats: { total: 0, new: 0, qualified: 0 },
      warning:
        "No leads visible yet. Re-run supabase/scripts/setup_inbound_leads.sql in Supabase (includes admin email allowlist), or add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server.",
    };
  }

  const enquiries = rows.map(mapEnterpriseEnquiry);

  return {
    ok: true,
    enquiries,
    stats: {
      total: rows.length,
      new: rows.filter((row) => row.status === "new").length,
      qualified: rows.filter((row) => row.status === "qualified").length,
    },
  };
}

export async function updateEnterpriseEnquiryAction(input: {
  id: string;
  status?: EnterpriseEnquiryStatus;
  adminNotes?: string;
}): Promise<EnterpriseEnquiryActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const updates: Record<string, string> = {};
  if (input.status !== undefined) updates.status = input.status;
  if (input.adminNotes !== undefined) updates.admin_notes = input.adminNotes;

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  const adminClient = createAdminClient();
  const queryClient = adminClient ?? auth.supabase;

  const { error } = await queryClient
    .from(ENTERPRISE_ENQUIRIES_TABLE)
    .update(updates)
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: formatEnquiryDbError(error.message) };
  }

  revalidatePath("/dashboard/admin/enquiries");

  return { ok: true };
}
