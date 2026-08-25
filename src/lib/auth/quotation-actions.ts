"use server";

import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getBillingSender } from "@/lib/auth/billing-business";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { validateEmail } from "@/lib/auth-validation";
import type { Quotation } from "@/lib/billing-data";
import { normalizeInvoiceItems } from "@/lib/billing/invoice-mapper";
import {
  calculateQuotationTotal,
  mapQuotationRecord,
  quotationRecordToDisplay,
} from "@/lib/billing/quotation-mapper";
import type { InvoiceLineItem } from "@/lib/database/invoices";
import {
  QUOTATIONS_TABLE,
  type QuotationInsert,
  type QuotationRecord,
  type QuotationStatus,
} from "@/lib/database/quotations";
import type { BillingSender } from "@/lib/mail/billing-document";
import { emailBillingDocument } from "@/lib/mail/billing-document";
import { isBillingMailConfigured } from "@/lib/mail/resend";
import { createClient } from "@/lib/supabase/server";

export type QuotationActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type QuotationsResult = QuotationActionResult & {
  quotations?: Array<Quotation & { recordId?: string; source?: "live" | "demo" }>;
  stats?: {
    totalQuotations: number;
    pendingQuotations: number;
    acceptedQuotations: number;
  };
};

export type SaveQuotationResult = QuotationActionResult & {
  quotation?: QuotationRecord;
  emailed?: boolean;
};

function isMissingTableError(message: string): boolean {
  return /quotations|schema cache|relation .* does not exist/i.test(message);
}

function formatQuotationDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Run migration 20260620190000_create_quotations.sql in Supabase SQL Editor, then refresh this page.";
  }

  if (/client_email|schema cache/i.test(message)) {
    return "Run supabase/scripts/add_quotation_client_email.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

type BillingAuth =
  | { ok: false; error: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: User;
      businessId: string;
      sender: BillingSender;
    };

async function requireBillingUser(): Promise<BillingAuth> {
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

  const senderResult = await getBillingSender(supabase, user.id, user.email);
  if ("error" in senderResult) {
    return { ok: false, error: senderResult.error };
  }

  return { ok: true, supabase, user, ...senderResult };
}

const emptyQuotationStats = {
  totalQuotations: 0,
  pendingQuotations: 0,
  acceptedQuotations: 0,
};

export async function getQuotationsAction(): Promise<QuotationsResult> {
  if (!isSupabaseAuthEnabled()) {
    return {
      ok: true,
      quotations: [],
      stats: emptyQuotationStats,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from(QUOTATIONS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: true,
        quotations: [],
        warning: formatQuotationDbError(error.message),
        stats: emptyQuotationStats,
      };
    }

    return { ok: false, error: formatQuotationDbError(error.message) };
  }

  const rows = ((data ?? []) as QuotationRecord[]).map(mapQuotationRecord);

  if (rows.length === 0) {
    return {
      ok: true,
      quotations: [],
      stats: emptyQuotationStats,
    };
  }

  const quotations = rows.map((row) => ({
    ...quotationRecordToDisplay(row),
    source: "live" as const,
  }));

  return {
    ok: true,
    quotations,
    stats: {
      totalQuotations: rows.length,
      pendingQuotations: rows.filter((row) => row.status === "sent").length,
      acceptedQuotations: rows.filter((row) => row.status === "accepted").length,
    },
  };
}

export async function saveQuotationAction(input: {
  clientName: string;
  clientEmail: string;
  items: InvoiceLineItem[];
  status?: QuotationStatus;
}): Promise<SaveQuotationResult> {
  const auth = await requireBillingUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user, businessId, sender } = auth;

  const items = normalizeInvoiceItems(input.items);
  if (items.length === 0) {
    return { ok: false, error: "Add at least one quotation line item." };
  }

  const status = input.status ?? "draft";
  const clientEmail = input.clientEmail.trim();

  if (status === "sent") {
    const emailError = validateEmail(clientEmail);
    if (emailError) {
      return { ok: false, error: "Enter a valid client email to send this quotation." };
    }
    if (!isBillingMailConfigured()) {
      return {
        ok: false,
        error:
          "Email sending is not configured yet. Save as draft, or add RESEND_API_KEY and try again.",
      };
    }
  }

  const payload: QuotationInsert = {
    user_id: user.id,
    business_id: businessId,
    client_name: input.clientName.trim(),
    client_email: clientEmail,
    items,
    total: calculateQuotationTotal(items),
    status,
  };

  const { data, error } = await supabase
    .from(QUOTATIONS_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatQuotationDbError(error.message) };
  }

  const quotation = mapQuotationRecord(data as QuotationRecord);
  revalidatePath("/dashboard/billing");

  if (status !== "sent") {
    return { ok: true, quotation, emailed: false };
  }

  const mailed = await emailBillingDocument({
    kind: "quotation",
    to: clientEmail,
    sender,
    quotation,
  });

  if (!mailed.ok) {
    return {
      ok: true,
      quotation,
      emailed: false,
      warning: `Quotation saved, but the email was not sent: ${mailed.error}`,
    };
  }

  return { ok: true, quotation, emailed: true };
}

export async function sendQuotationEmailAction(input: {
  quotationId: string;
}): Promise<SaveQuotationResult> {
  const auth = await requireBillingUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user, sender } = auth;

  if (!isBillingMailConfigured()) {
    return {
      ok: false,
      error: "Email sending is not configured yet. Add RESEND_API_KEY and try again.",
    };
  }

  const { data, error } = await supabase
    .from(QUOTATIONS_TABLE)
    .select("*")
    .eq("id", input.quotationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: formatQuotationDbError(error.message) };
  }
  if (!data) {
    return { ok: false, error: "Quotation not found." };
  }

  const quotation = mapQuotationRecord(data as QuotationRecord);
  const emailError = validateEmail(quotation.client_email);
  if (emailError) {
    return {
      ok: false,
      error: "This quotation has no client email. Create a new one with the client address.",
    };
  }

  const mailed = await emailBillingDocument({
    kind: "quotation",
    to: quotation.client_email,
    sender,
    quotation,
  });

  if (!mailed.ok) {
    return { ok: false, error: mailed.error, quotation };
  }

  if (quotation.status === "draft") {
    await supabase
      .from(QUOTATIONS_TABLE)
      .update({ status: "sent" })
      .eq("id", quotation.id)
      .eq("user_id", user.id);
  }

  revalidatePath("/dashboard/billing");
  return { ok: true, quotation, emailed: true };
}

export async function updateQuotationStatusAction(input: {
  quotationId: string;
  status: QuotationStatus;
}): Promise<SaveQuotationResult> {
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

  const { data, error } = await supabase
    .from(QUOTATIONS_TABLE)
    .update({ status: input.status })
    .eq("id", input.quotationId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatQuotationDbError(error.message) };
  }

  revalidatePath("/dashboard/billing");

  return {
    ok: true,
    quotation: mapQuotationRecord(data as QuotationRecord),
  };
}
