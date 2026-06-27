export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "pending"
  | "overdue"
  | "cancelled"
  | "failed";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export type InvoiceRecord = {
  id: string;
  user_id: string;
  business_id: string;
  client_name: string;
  client_email: string;
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  due_date: string | null;
  created_at: string;
};

export type InvoiceInsert = Pick<
  InvoiceRecord,
  "user_id" | "business_id" | "client_name" | "client_email"
> &
  Partial<
    Pick<
      InvoiceRecord,
      "items" | "subtotal" | "tax" | "total" | "status" | "due_date"
    >
  >;

export type InvoiceUpdate = Partial<
  Pick<
    InvoiceRecord,
    | "client_name"
    | "client_email"
    | "items"
    | "subtotal"
    | "tax"
    | "total"
    | "status"
    | "due_date"
  >
>;

export const INVOICES_TABLE = "invoices" as const;

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "pending",
  "overdue",
  "cancelled",
  "failed",
];
