import { parseAdminEmails } from "@/lib/auth/admin-emails";
import { isBillingMailConfigured, sendEmail } from "@/lib/mail/resend";
import { siteContact } from "@/lib/site-contact";
import { getSiteUrl } from "@/lib/site-url";

export type MemberWelcomeInput = {
  fullName: string;
  businessName: string;
  email: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || "there";
}

export async function sendMemberWelcomeEmail(input: MemberWelcomeInput): Promise<void> {
  const to = input.email.trim();
  if (!to) {
    console.error("Member welcome skipped: no member email.");
    return;
  }

  if (!isBillingMailConfigured()) {
    console.error("Member welcome skipped: RESEND_API_KEY is not set.");
    return;
  }

  const site = getSiteUrl();
  const dashboardUrl = `${site}/dashboard`;
  const profileUrl = `${site}/dashboard/profile`;
  const name = firstName(input.fullName);
  const business = input.businessName.trim() || "your business";
  const replyTo = parseAdminEmails()[0];

  const subject = "Welcome to AfriGrow Hub — your registration is confirmed";
  const html = `
    <div style="font-family:Georgia,serif;background:#e8f5ef;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #d5e6de;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b4a;font-weight:700;">AfriGrow Hub</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#0a4d35;">Welcome, ${escapeHtml(name)}</h1>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          ${escapeHtml(business)} is now registered as a founding member of AfriGrow Hub. You are in.
        </p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          Founding membership is free during early access — no card required.
        </p>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">Suggested first steps:</p>
        <ol style="margin:8px 0 0;padding-left:20px;font-size:15px;line-height:1.6;color:#1a1a1a;">
          <li>Complete your <strong>Business Profile</strong></li>
          <li>Try the <strong>Marketing Agent</strong> for one promo</li>
          <li>Add a few contacts in <strong>CRM</strong></li>
          <li>Open <strong>Training</strong> if you want a live course</li>
        </ol>
        <p style="margin:24px 0 0;">
          <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#0f6b4a;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:700;">Open your dashboard</a>
        </p>
        <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#5c6b64;">
          Profile: <a href="${escapeHtml(profileUrl)}" style="color:#0f6b4a;">${escapeHtml(profileUrl)}</a>
        </p>
        <p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#1a1a1a;">
          Stuck? Reply to this email or write to ${escapeHtml(siteContact.email)}.
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#5c6b64;">
          AfriGrow Hub · www.afrigrow.app
        </p>
      </div>
    </div>`;

  const text = [
    `Welcome to AfriGrow Hub, ${name}`,
    "",
    `${business} is now registered as a founding member of AfriGrow Hub. You are in.`,
    "",
    "Founding membership is free during early access — no card required.",
    "",
    "Suggested first steps:",
    "1. Complete your Business Profile",
    "2. Try the Marketing Agent for one promo",
    "3. Add a few contacts in CRM",
    "4. Open Training if you want a live course",
    "",
    `Dashboard: ${dashboardUrl}`,
    `Profile: ${profileUrl}`,
    "",
    `Stuck? Reply to this email or write to ${siteContact.email}.`,
  ].join("\n");

  const result = await sendEmail({
    to,
    subject,
    html,
    text,
    replyTo,
  });

  if (!result.ok) {
    console.error("Member welcome email failed:", result.error);
  }
}
