"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import type { Quotation } from "@/lib/billing-data";
import { normalizeInvoiceItems } from "@/lib/billing/invoice-mapper";
import {
  calculateQuotationTotal,
  mapQuotationRecord,
  quotationRecordToDisplay,
} from "@/lib/billing/quotation-mapper";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import type { InvoiceLineItem } from "@/lib/database/invoices";
import {
  QUOTATIONS_TABLE,
  type QuotationInsert,
  type QuotationRecord,
  type QuotationStatus,
} from "@/lib/database/quotations";
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
};

function isMissingTableError(message: string): boolean {
  return /quotations|schema cache|relation .* does not exist/i.test(message);
}

function formatQuotationDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Run migration 20260620190000_create_quotations.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

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
  items: InvoiceLineItem[];
  status?: QuotationStatus;
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

  const { businessId, error: businessError } = await getUserBusinessId(supabase, user.id);
  if (!businessId) {
    return { ok: false, error: businessError };
  }

  const items = normalizeInvoiceItems(input.items);
  if (items.length === 0) {
    return { ok: false, error: "Add at least one quotation line item." };
  }

  const payload: QuotationInsert = {
    user_id: user.id,
    business_id: businessId,
    client_name: input.clientName.trim(),
    items,
    total: calculateQuotationTotal(items),
    status: input.status ?? "draft",
  };

  const { data, error } = await supabase
    .from(QUOTATIONS_TABLE)
    .insert(payload)
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
