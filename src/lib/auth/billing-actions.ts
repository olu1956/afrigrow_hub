"use server";

import type { User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getBillingSender } from "@/lib/auth/billing-business";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { validateEmail } from "@/lib/auth-validation";
import {
  calculateInvoiceTotals,
  invoiceRecordToDisplay,
  mapInvoiceRecord,
  normalizeInvoiceItems,
} from "@/lib/billing/invoice-mapper";
import type { Invoice } from "@/lib/billing-data";
import {
  INVOICES_TABLE,
  type InvoiceInsert,
  type InvoiceLineItem,
  type InvoiceRecord,
  type InvoiceStatus,
} from "@/lib/database/invoices";
import type { BillingSender } from "@/lib/mail/billing-document";
import { emailBillingDocument } from "@/lib/mail/billing-document";
import { isBillingMailConfigured } from "@/lib/mail/resend";
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
  emailed?: boolean;
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

function formatInvoiceEmailWarning(error: string): string {
  return `Invoice saved, but the email was not sent: ${error}`;
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
  const auth = await requireBillingUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user, businessId, sender } = auth;

  const items = normalizeInvoiceItems(input.items);
  if (items.length === 0) {
    return { ok: false, error: "Add at least one invoice line item." };
  }

  const status = input.status ?? "draft";
  const clientEmail = input.clientEmail.trim();

  if (status === "sent") {
    const emailError = validateEmail(clientEmail);
    if (emailError) {
      return { ok: false, error: "Enter a valid client email to send this invoice." };
    }
    if (!isBillingMailConfigured()) {
      return {
        ok: false,
        error:
          "Email sending is not configured yet. Save as draft, or add RESEND_API_KEY and try again.",
      };
    }
  }

  const totals = calculateInvoiceTotals(items, input.taxRate ?? 0);
  const payload: InvoiceInsert = {
    user_id: user.id,
    business_id: businessId,
    client_name: input.clientName.trim(),
    client_email: clientEmail,
    items,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    status,
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

  const invoice = mapInvoiceRecord(data as InvoiceRecord);
  revalidatePath("/dashboard/billing");

  if (status !== "sent") {
    return { ok: true, invoice, emailed: false };
  }

  const mailed = await emailBillingDocument({
    kind: "invoice",
    to: clientEmail,
    sender,
    invoice,
  });

  if (!mailed.ok) {
    return {
      ok: true,
      invoice,
      emailed: false,
      warning: formatInvoiceEmailWarning(mailed.error),
    };
  }

  return { ok: true, invoice, emailed: true };
}

export async function sendInvoiceEmailAction(input: {
  invoiceId: string;
}): Promise<SaveInvoiceResult> {
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
    .from(INVOICES_TABLE)
    .select("*")
    .eq("id", input.invoiceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: formatBillingDbError(error.message) };
  }
  if (!data) {
    return { ok: false, error: "Invoice not found." };
  }

  const invoice = mapInvoiceRecord(data as InvoiceRecord);
  const emailError = validateEmail(invoice.client_email);
  if (emailError) {
    return { ok: false, error: "This invoice has no valid client email." };
  }

  const mailed = await emailBillingDocument({
    kind: "invoice",
    to: invoice.client_email,
    sender,
    invoice,
  });

  if (!mailed.ok) {
    return { ok: false, error: mailed.error, invoice };
  }

  if (invoice.status === "draft") {
    await supabase
      .from(INVOICES_TABLE)
      .update({ status: "sent" })
      .eq("id", invoice.id)
      .eq("user_id", user.id);
  }

  revalidatePath("/dashboard/billing");
  return { ok: true, invoice, emailed: true };
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

export async function deleteInvoiceAction(input: {
  invoiceId: string;
}): Promise<BillingActionResult> {
  const auth = await requireBillingUser();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user } = auth;

  const { error } = await supabase
    .from(INVOICES_TABLE)
    .delete()
    .eq("id", input.invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: formatBillingDbError(error.message) };
  }

  revalidatePath("/dashboard/billing");
  return { ok: true };
}
