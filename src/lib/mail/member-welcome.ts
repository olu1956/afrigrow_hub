import type { User } from "@supabase/supabase-js";
import { parseAdminEmails } from "@/lib/auth/admin-emails";
import { isBillingMailConfigured, sendEmail } from "@/lib/mail/resend";
import { siteContact } from "@/lib/site-contact";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type MemberWelcomeInput = {
  fullName: string;
  businessName: string;
  email: string;
};

export type WelcomeEmailResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

const WELCOME_SENT_KEY = "welcome_email_sent";
const FRESH_SIGNUP_MS = 24 * 60 * 60 * 1000;

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

function isFreshSignup(createdAt: string | undefined): boolean {
  const created = Date.parse(createdAt ?? "");
  return Number.isFinite(created) && Date.now() - created <= FRESH_SIGNUP_MS;
}

function welcomeAlreadySent(user: User): boolean {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return meta[WELCOME_SENT_KEY] === true || meta[WELCOME_SENT_KEY] === "true";
}

async function markWelcomeSent(user: User): Promise<void> {
  const meta = { ...(user.user_metadata ?? {}), [WELCOME_SENT_KEY]: true };
  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: meta,
    });
    if (error) {
      console.error("Could not flag welcome email as sent:", error.message);
    }
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { [WELCOME_SENT_KEY]: true },
  });
  if (error) {
    console.error("Could not flag welcome email as sent:", error.message);
  }
}

export async function sendMemberWelcomeEmail(
  input: MemberWelcomeInput,
): Promise<WelcomeEmailResult> {
  const to = input.email.trim();
  if (!to) {
    console.error("Member welcome skipped: no member email.");
    return { ok: false, error: "no member email" };
  }

  if (!isBillingMailConfigured()) {
    console.error("Member welcome skipped: RESEND_API_KEY is not set.");
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const site = getSiteUrl();
  const dashboardUrl = `${site}/dashboard`;
  const profileUrl = `${site}/dashboard/profile`;
  const trainingUrl = `${site}/dashboard/training`;
  const name = firstName(input.fullName);
  const business = input.businessName.trim() || "your business";
  const replyTo = parseAdminEmails()[0] || siteContact.email;

  const subject = "Your AfriGrow Hub registration is confirmed";
  const html = `
    <div style="font-family:Georgia,serif;background:#e8f5ef;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #d5e6de;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b4a;font-weight:700;">AfriGrow Hub</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#0a4d35;">Registration confirmed</h1>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          Welcome, ${escapeHtml(name)}. This email confirms that <strong>${escapeHtml(business)}</strong> is registered as a founding member of AfriGrow Hub.
        </p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
          Founding membership is free during early access — no card required. You can log in and start using the Hub now.
        </p>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">Suggested first steps:</p>
        <ol style="margin:8px 0 0;padding-left:20px;font-size:15px;line-height:1.6;color:#1a1a1a;">
          <li>Complete your <strong>Business Profile</strong></li>
          <li>Try the <strong>Marketing Agent</strong> for one promo</li>
          <li>Add a few contacts in <strong>CRM</strong></li>
          <li>Open <strong>Training</strong> for live courses and a simple certificate</li>
        </ol>
        <p style="margin:24px 0 0;">
          <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#0f6b4a;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:700;">Open your dashboard</a>
        </p>
        <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#5c6b64;">
          Profile: <a href="${escapeHtml(profileUrl)}" style="color:#0f6b4a;">${escapeHtml(profileUrl)}</a><br />
          Training: <a href="${escapeHtml(trainingUrl)}" style="color:#0f6b4a;">${escapeHtml(trainingUrl)}</a>
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
    "Your AfriGrow Hub registration is confirmed",
    "",
    `Welcome, ${name}. This email confirms that ${business} is registered as a founding member of AfriGrow Hub.`,
    "",
    "Founding membership is free during early access — no card required. You can log in and start using the Hub now.",
    "",
    "Suggested first steps:",
    "1. Complete your Business Profile",
    "2. Try the Marketing Agent for one promo",
    "3. Add a few contacts in CRM",
    "4. Open Training for live courses and a simple certificate",
    "",
    `Dashboard: ${dashboardUrl}`,
    `Profile: ${profileUrl}`,
    `Training: ${trainingUrl}`,
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
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

export async function ensureMemberWelcomeEmail(
  user: User,
  details?: Partial<MemberWelcomeInput>,
): Promise<WelcomeEmailResult> {
  const email = details?.email?.trim() || user.email || "";
  if (!email) {
    return { ok: false, error: "no member email" };
  }

  if (welcomeAlreadySent(user)) {
    return { ok: true, skipped: true };
  }

  if (!isFreshSignup(user.created_at)) {
    await markWelcomeSent(user);
    return { ok: true, skipped: true };
  }

  const meta = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    business_name?: string;
  };

  const result = await sendMemberWelcomeEmail({
    fullName:
      details?.fullName?.trim() ||
      meta.full_name?.trim() ||
      meta.name?.trim() ||
      email.split("@")[0] ||
      "there",
    businessName: details?.businessName?.trim() || meta.business_name?.trim() || "your business",
    email,
  });

  if (result.ok) {
    await markWelcomeSent(user);
  }

  return result;
}
