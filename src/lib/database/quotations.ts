import type { InvoiceLineItem } from "@/lib/database/invoices";

export type QuotationStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export type QuotationRecord = {
  id: string;
  user_id: string;
  business_id: string;
  client_name: string;
  client_email: string;
  items: InvoiceLineItem[];
  total: number;
  status: QuotationStatus;
  created_at: string;
};

export type QuotationInsert = Pick<
  QuotationRecord,
  "user_id" | "business_id" | "client_name" | "client_email"
> &
  Partial<Pick<QuotationRecord, "items" | "total" | "status">>;

export type QuotationUpdate = Partial<
  Pick<QuotationRecord, "client_name" | "client_email" | "items" | "total" | "status">
>;

export const QUOTATIONS_TABLE = "quotations" as const;

export const QUOTATION_STATUSES: QuotationStatus[] = [
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
];
