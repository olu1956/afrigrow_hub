import {
  formatInvoiceMoney,
  formatInvoiceNumber,
  formatInvoiceDate,
} from "@/lib/billing/invoice-mapper";
import { formatQuotationNumber } from "@/lib/billing/quotation-mapper";
import type { InvoiceLineItem, InvoiceRecord } from "@/lib/database/invoices";
import type { QuotationRecord } from "@/lib/database/quotations";
import { sendEmail, type SendEmailResult } from "@/lib/mail/resend";

export type BillingSender = {
  businessName: string;
  businessEmail: string;
  ownerEmail?: string;
};

export type BillingDocumentKind = "invoice" | "quotation";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lineItemsHtml(items: InvoiceLineItem[]): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e8f5ef;">${escapeHtml(item.description)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8f5ef;text-align:right;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8f5ef;text-align:right;">${escapeHtml(formatInvoiceMoney(item.unit_price))}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8f5ef;text-align:right;">${escapeHtml(formatInvoiceMoney(item.amount))}</td>
        </tr>`,
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;font-size:14px;color:#1a1a1a;">
      <thead>
        <tr>
          <th align="left" style="padding-bottom:8px;color:#5c6b64;font-weight:600;">Item</th>
          <th align="right" style="padding-bottom:8px;color:#5c6b64;font-weight:600;">Qty</th>
          <th align="right" style="padding-bottom:8px;color:#5c6b64;font-weight:600;">Price</th>
          <th align="right" style="padding-bottom:8px;color:#5c6b64;font-weight:600;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function lineItemsText(items: InvoiceLineItem[]): string {
  return items
    .map(
      (item) =>
        `- ${item.description} × ${item.quantity} @ ${formatInvoiceMoney(item.unit_price)} = ${formatInvoiceMoney(item.amount)}`,
    )
    .join("\n");
}

export function buildInvoiceEmail(input: {
  invoice: InvoiceRecord;
  sender: BillingSender;
}): { subject: string; html: string; text: string } {
  const number = formatInvoiceNumber(input.invoice.id, input.invoice.created_at);
  const due = input.invoice.due_date
    ? formatInvoiceDate(input.invoice.due_date)
    : null;
  const business = input.sender.businessName.trim() || "an AfriGrow Hub member";
  const kindLabel = "Invoice";

  const subject = `${kindLabel} ${number} from ${business}`;
  const html = `
    <div style="font-family:Georgia,serif;background:#e8f5ef;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #d5e6de;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b4a;font-weight:700;">AfriGrow Hub</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#0a4d35;">${kindLabel} ${escapeHtml(number)}</h1>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          Hello ${escapeHtml(input.invoice.client_name.trim() || "there")},
        </p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          ${escapeHtml(business)} has sent you this invoice via AfriGrow Hub.
        </p>
        ${lineItemsHtml(input.invoice.items)}
        <p style="margin:16px 0 0;font-size:14px;color:#5c6b64;">
          Subtotal ${escapeHtml(formatInvoiceMoney(input.invoice.subtotal))}
          · Tax ${escapeHtml(formatInvoiceMoney(input.invoice.tax))}
        </p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#0f6b4a;">
          Total ${escapeHtml(formatInvoiceMoney(input.invoice.total))}
        </p>
        ${
          due
            ? `<p style="margin:8px 0 0;font-size:14px;color:#5c6b64;">Due ${escapeHtml(due)}</p>`
            : ""
        }
        <p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#1a1a1a;">
          Reply to this email to arrange payment with ${escapeHtml(business)}.
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#5c6b64;">
          Sent via AfriGrow Hub · www.afrigrow.app
        </p>
      </div>
    </div>`;

  const text = [
    `${kindLabel} ${number} from ${business}`,
    "",
    `Hello ${input.invoice.client_name.trim() || "there"},`,
    "",
    `${business} has sent you this invoice via AfriGrow Hub.`,
    "",
    lineItemsText(input.invoice.items),
    "",
    `Subtotal ${formatInvoiceMoney(input.invoice.subtotal)}`,
    `Tax ${formatInvoiceMoney(input.invoice.tax)}`,
    `Total ${formatInvoiceMoney(input.invoice.total)}`,
    due ? `Due ${due}` : "",
    "",
    `Reply to this email to arrange payment with ${business}.`,
    "",
    "Sent via AfriGrow Hub · https://www.afrigrow.app",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject, html, text };
}

export function buildQuotationEmail(input: {
  quotation: QuotationRecord;
  sender: BillingSender;
}): { subject: string; html: string; text: string } {
  const number = formatQuotationNumber(input.quotation.id, input.quotation.created_at);
  const business = input.sender.businessName.trim() || "an AfriGrow Hub member";
  const kindLabel = "Quotation";

  const subject = `${kindLabel} ${number} from ${business}`;
  const html = `
    <div style="font-family:Georgia,serif;background:#e8f5ef;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #d5e6de;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b4a;font-weight:700;">AfriGrow Hub</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#0a4d35;">${kindLabel} ${escapeHtml(number)}</h1>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          Hello ${escapeHtml(input.quotation.client_name.trim() || "there")},
        </p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          ${escapeHtml(business)} has sent you this quotation via AfriGrow Hub.
        </p>
        ${lineItemsHtml(input.quotation.items)}
        <p style="margin:16px 0 0;font-size:18px;font-weight:700;color:#0f6b4a;">
          Total ${escapeHtml(formatInvoiceMoney(input.quotation.total))}
        </p>
        <p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#1a1a1a;">
          Reply to this email to accept or discuss this quote with ${escapeHtml(business)}.
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#5c6b64;">
          Sent via AfriGrow Hub · www.afrigrow.app
        </p>
      </div>
    </div>`;

  const text = [
    `${kindLabel} ${number} from ${business}`,
    "",
    `Hello ${input.quotation.client_name.trim() || "there"},`,
    "",
    `${business} has sent you this quotation via AfriGrow Hub.`,
    "",
    lineItemsText(input.quotation.items),
    "",
    `Total ${formatInvoiceMoney(input.quotation.total)}`,
    "",
    `Reply to this email to accept or discuss this quote with ${business}.`,
    "",
    "Sent via AfriGrow Hub · https://www.afrigrow.app",
  ].join("\n");

  return { subject, html, text };
}

export async function emailBillingDocument(input: {
  kind: BillingDocumentKind;
  to: string;
  sender: BillingSender;
  invoice?: InvoiceRecord;
  quotation?: QuotationRecord;
}): Promise<SendEmailResult> {
  const to = input.to.trim();
  if (!to) {
    return { ok: false, error: "Enter the client email so we can send this." };
  }

  const content =
    input.kind === "invoice" && input.invoice
      ? buildInvoiceEmail({ invoice: input.invoice, sender: input.sender })
      : input.kind === "quotation" && input.quotation
        ? buildQuotationEmail({ quotation: input.quotation, sender: input.sender })
        : null;

  if (!content) {
    return { ok: false, error: "Missing invoice or quotation details." };
  }

  const copyTo =
    input.sender.businessEmail.trim() || input.sender.ownerEmail?.trim() || undefined;

  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    replyTo: copyTo,
    bcc: copyTo,
  });
}
