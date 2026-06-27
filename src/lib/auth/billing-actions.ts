"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import {
  calculateInvoiceTotals,
  invoiceRecordToDisplay,
  mapInvoiceRecord,
  normalizeInvoiceItems,
} from "@/lib/billing/invoice-mapper";
import type { Invoice } from "@/lib/billing-data";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import {
  INVOICES_TABLE,
  type InvoiceInsert,
  type InvoiceLineItem,
  type InvoiceRecord,
  type InvoiceStatus,
} from "@/lib/database/invoices";
import { createClient } from "@/lib/supabase/server";

export type BillingActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type InvoicesResult = BillingActionResult & {
  invoices?: Array<
    Invoice & { recordId?: string; clientEmail?: string; dueDate?: string | null; source?: "live" | "demo" }
  >;
  stats?: {
    totalInvoices: number;
    paidInvoices: number;
    outstandingInvoices: number;
  };
};

export type SaveInvoiceResult = BillingActionResult & {
  invoice?: InvoiceRecord;
};

function isMissingTableError(message: string): boolean {
  return /invoices|schema cache|relation .* does not exist/i.test(message);
}

function formatBillingDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Run migration 20260620180000_create_invoices.sql in Supabase SQL Editor, then refresh this page.";
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

const emptyInvoiceStats = {
  totalInvoices: 0,
  paidInvoices: 0,
  outstandingInvoices: 0,
};

export async function getInvoicesAction(): Promise<InvoicesResult> {
  if (!isSupabaseAuthEnabled()) {
    return {
      ok: true,
      invoices: [],
      stats: emptyInvoiceStats,
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
    .from(INVOICES_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: true,
        invoices: [],
        warning: formatBillingDbError(error.message),
        stats: emptyInvoiceStats,
      };
    }

    return { ok: false, error: formatBillingDbError(error.message) };
  }

  const rows = ((data ?? []) as InvoiceRecord[]).map(mapInvoiceRecord);

  if (rows.length === 0) {
    return {
      ok: true,
      invoices: [],
      stats: emptyInvoiceStats,
    };
  }

  const invoices = rows.map((row) => ({
    ...invoiceRecordToDisplay(row),
    source: "live" as const,
  }));

  return {
    ok: true,
    invoices,
    stats: {
      totalInvoices: rows.length,
      paidInvoices: rows.filter((row) => row.status === "paid").length,
      outstandingInvoices: rows.filter((row) =>
        ["sent", "pending", "overdue"].includes(row.status),
      ).length,
    },
  };
}

export async function saveInvoiceAction(input: {
  clientName: string;
  clientEmail: string;
  items: InvoiceLineItem[];
  status?: InvoiceStatus;
  dueDate?: string | null;
  taxRate?: number;
}): Promise<SaveInvoiceResult> {
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
    return { ok: false, error: "Add at least one invoice line item." };
  }

  const totals = calculateInvoiceTotals(items, input.taxRate ?? 0);
  const payload: InvoiceInsert = {
    user_id: user.id,
    business_id: businessId,
    client_name: input.clientName.trim(),
    client_email: input.clientEmail.trim(),
    items,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    status: input.status ?? "draft",
    due_date: input.dueDate ?? null,
  };

  const { data, error } = await supabase
    .from(INVOICES_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatBillingDbError(error.message) };
  }

  revalidatePath("/dashboard/billing");

  return {
    ok: true,
    invoice: mapInvoiceRecord(data as InvoiceRecord),
  };
}

export async function updateInvoiceStatusAction(input: {
  invoiceId: string;
  status: InvoiceStatus;
}): Promise<SaveInvoiceResult> {
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
    .from(INVOICES_TABLE)
    .update({ status: input.status })
    .eq("id", input.invoiceId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatBillingDbError(error.message) };
  }

  revalidatePath("/dashboard/billing");

  return {
    ok: true,
    invoice: mapInvoiceRecord(data as InvoiceRecord),
  };
}
