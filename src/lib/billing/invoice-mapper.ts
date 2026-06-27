import type { InvoiceRecord, InvoiceLineItem } from "@/lib/database/invoices";
import type { Invoice } from "@/lib/billing-data";

function parseAmount(value: number | string): number {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeInvoiceItems(raw: unknown): InvoiceLineItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<InvoiceLineItem>;
      const quantity = Number(row.quantity ?? 1);
      const unitPrice = parseAmount(row.unit_price ?? 0);
      const amount = parseAmount(row.amount ?? quantity * unitPrice);

      return {
        description: String(row.description ?? "").trim(),
        quantity: Number.isFinite(quantity) ? quantity : 1,
        unit_price: unitPrice,
        amount,
      };
    })
    .filter((item): item is InvoiceLineItem => Boolean(item?.description));
}

export function summarizeInvoiceItems(items: InvoiceLineItem[]): string {
  if (items.length === 0) return "Invoice";
  if (items.length === 1) return items[0].description;
  return `${items[0].description} + ${items.length - 1} more`;
}

export function formatInvoiceNumber(id: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const suffix = id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `INV-${year}-${suffix}`;
}

export function formatInvoiceDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatInvoiceMoney(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function mapInvoiceRecord(row: InvoiceRecord): InvoiceRecord {
  return {
    ...row,
    subtotal: parseAmount(row.subtotal),
    tax: parseAmount(row.tax),
    total: parseAmount(row.total),
    items: normalizeInvoiceItems(row.items),
    due_date: row.due_date ?? null,
  };
}

export function invoiceRecordToDisplay(
  row: InvoiceRecord,
  currency = "GBP",
): Invoice & { recordId: string; clientEmail: string; dueDate: string | null } {
  const items = normalizeInvoiceItems(row.items);
  const displayStatus: Invoice["status"] =
    row.status === "sent" ? "pending" : row.status === "failed" ? "failed" : row.status;

  return {
    recordId: row.id,
    id: formatInvoiceNumber(row.id, row.created_at),
    date: formatInvoiceDate(row.created_at),
    description: `${row.client_name.trim()} — ${summarizeInvoiceItems(items)}`,
    amount: formatInvoiceMoney(parseAmount(row.total), currency),
    status: displayStatus,
    clientEmail: row.client_email,
    dueDate: row.due_date,
  };
}

export function calculateInvoiceTotals(items: InvoiceLineItem[], taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return { subtotal, tax, total };
}

export function countPaidInvoices(rows: InvoiceRecord[]): number {
  return rows.filter((row) => row.status === "paid").length;
}

export function countOutstandingInvoices(rows: InvoiceRecord[]): number {
  return rows.filter((row) =>
    ["sent", "pending", "overdue"].includes(row.status),
  ).length;
}
