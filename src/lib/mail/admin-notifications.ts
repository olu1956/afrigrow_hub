import { parseAdminEmails } from "@/lib/auth/admin-emails";
import { isBillingMailConfigured, sendEmail } from "@/lib/mail/resend";
import { getSiteUrl } from "@/lib/site-url";

export type SignupAlertInput = {
  fullName: string;
  businessName: string;
  email: string;
  businessType?: string;
  country?: string;
  source?: "email" | "google";
};

export type EnquiryAlertInput = {
  name: string;
  email: string;
  companyName?: string;
  subject?: string;
  message: string;
  enquiryType?: string;
  source?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function row(label: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;"><strong style="color:#5c6b64;">${escapeHtml(label)}:</strong> ${escapeHtml(trimmed)}</p>`;
}

function textRow(label: string, value: string): string {
  const trimmed = value.trim();
  return trimmed ? `${label}: ${trimmed}` : "";
}

function wrapHtml(title: string, body: string, ctaLabel: string, ctaHref: string): string {
  return `
    <div style="font-family:Georgia,serif;background:#e8f5ef;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #d5e6de;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b4a;font-weight:700;">AfriGrow Hub</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#0a4d35;">${escapeHtml(title)}</h1>
        ${body}
        <p style="margin:24px 0 0;">
          <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:#0f6b4a;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:700;">${escapeHtml(ctaLabel)}</a>
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#5c6b64;">
          Sent to your admin inbox · www.afrigrow.app
        </p>
      </div>
    </div>`;
}

async function sendToAdmins(input: {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  if (!isBillingMailConfigured()) {
    console.error("Admin notification skipped: RESEND_API_KEY is not set.");
    return;
  }

  const recipients = parseAdminEmails();
  if (recipients.length === 0) {
    console.error("Admin notification skipped: no admin emails configured.");
    return;
  }

  const results = await Promise.all(
    recipients.map((to) =>
      sendEmail({
        to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      }),
    ),
  );

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(
      "Admin notification email failed:",
      failed.map((result) => result.error).join("; "),
    );
  }
}

export async function notifyAdminsOfSignup(input: SignupAlertInput): Promise<void> {
  const site = getSiteUrl();
  const directoryUrl = `${site}/dashboard/admin/directory`;
  const source = input.source === "google" ? "Google" : "email signup";
  const business = input.businessName.trim() || "Untitled business";
  const subject = `New AfriGrow member: ${business}`;

  const html = wrapHtml(
    "New business registered",
    [
      row("Name", input.fullName),
      row("Business", business),
      row("Email", input.email),
      row("Type", input.businessType ?? ""),
      row("Country", input.country ?? ""),
      row("Joined via", source),
    ].join(""),
    "Open member directory",
    directoryUrl,
  );

  const text = [
    "New business registered on AfriGrow Hub",
    "",
    textRow("Name", input.fullName),
    textRow("Business", business),
    textRow("Email", input.email),
    textRow("Type", input.businessType ?? ""),
    textRow("Country", input.country ?? ""),
    textRow("Joined via", source),
    "",
    `Directory: ${directoryUrl}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  await sendToAdmins({
    subject,
    html,
    text,
    replyTo: input.email.trim() || undefined,
  });
}

export async function notifyAdminsOfEnquiry(input: EnquiryAlertInput): Promise<void> {
  const site = getSiteUrl();
  const inboxUrl = `${site}/dashboard/admin/enquiries`;
  const kind = (input.enquiryType || input.source || "message").trim() || "message";
  const subjectLine = input.subject?.trim() || input.companyName?.trim() || input.name.trim();
  const subject = `New AfriGrow ${kind}: ${subjectLine}`;

  const html = wrapHtml(
    "New inbound message",
    [
      row("From", input.name),
      row("Email", input.email),
      row("Company", input.companyName ?? ""),
      row("Type", kind),
      row("Subject", input.subject ?? ""),
      `<p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(input.message.trim())}</p>`,
    ].join(""),
    "Open inbound leads",
    inboxUrl,
  );

  const text = [
    "New inbound message on AfriGrow Hub",
    "",
    textRow("From", input.name),
    textRow("Email", input.email),
    textRow("Company", input.companyName ?? ""),
    textRow("Type", kind),
    textRow("Subject", input.subject ?? ""),
    "",
    input.message.trim(),
    "",
    `Inbox: ${inboxUrl}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  await sendToAdmins({
    subject,
    html,
    text,
    replyTo: input.email.trim() || undefined,
  });
}
