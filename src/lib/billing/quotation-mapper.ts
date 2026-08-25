import type { Quotation } from "@/lib/billing-data";
import type { QuotationRecord } from "@/lib/database/quotations";
import type { InvoiceLineItem } from "@/lib/database/invoices";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  normalizeInvoiceItems,
  summarizeInvoiceItems,
} from "@/lib/billing/invoice-mapper";

function parseAmount(value: number | string): number {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatQuotationNumber(id: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const suffix = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `QUO-${year}-${suffix}`;
}

export function calculateQuotationTotal(items: InvoiceLineItem[]): number {
  return Math.round(
    items.reduce((sum, item) => sum + parseAmount(item.amount), 0) * 100,
  ) / 100;
}

export function mapQuotationRecord(row: QuotationRecord): QuotationRecord {
  return {
    ...row,
    client_email: row.client_email?.trim() ?? "",
    total: parseAmount(row.total),
    items: normalizeInvoiceItems(row.items),
  };
}

export function quotationRecordToDisplay(
  row: QuotationRecord,
  currency = "GBP",
): Quotation & { recordId: string; clientEmail: string } {
  const items = normalizeInvoiceItems(row.items);

  return {
    recordId: row.id,
    id: formatQuotationNumber(row.id, row.created_at),
    date: formatInvoiceDate(row.created_at),
    clientName: row.client_name.trim(),
    clientEmail: row.client_email?.trim() ?? "",
    description: summarizeInvoiceItems(items),
    amount: formatInvoiceMoney(parseAmount(row.total), currency),
    status: row.status,
  };
}
