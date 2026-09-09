import { parseAdminEmails } from "@/lib/auth/admin-emails";
import { isBillingMailConfigured, sendEmail } from "@/lib/mail/resend";
import { siteContact } from "@/lib/site-contact";
import { getSiteUrl } from "@/lib/site-url";
import { postTrainingSteps } from "@/lib/training/post-training-checklist";

export type PostTrainingEmailInput = {
  fullName: string;
  email: string;
  courseTitle?: string;
  sessionTitle?: string;
  zoomUrl?: string;
  variant: "enrolled" | "after-session";
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

export async function sendPostTrainingFollowUpEmail(
  input: PostTrainingEmailInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = input.email.trim();
  if (!to) {
    return { ok: false, error: "No email address to send to." };
  }

  if (!isBillingMailConfigured()) {
    return { ok: false, error: "Email sending is not configured." };
  }

  const site = getSiteUrl();
  const checklistUrl = `${site}/after-training`;
  const dashboardUrl = `${site}/dashboard/next-steps`;
  const name = firstName(input.fullName);
  const replyTo = parseAdminEmails()[0];
  const course = input.courseTitle?.trim();
  const session = input.sessionTitle?.trim();
  const afterSession = input.variant === "after-session";

  const subject = afterSession
    ? "Your AfriGrow next steps after training"
    : course
      ? `You’re booked: ${course} — plus what to do after`
      : "You’re booked for AfriGrow training — plus what to do after";

  const intro = afterSession
    ? `Thanks for joining AfriGrow training. Here is your short checklist so the session turns into action this week.`
    : `You are booked on AfriGrow training. After the session, use this checklist so you keep momentum.`;

  const stepsHtml = postTrainingSteps
    .map(
      (step, index) => `
        <li style="margin:0 0 10px;font-size:15px;line-height:1.5;color:#1a1a1a;">
          <strong>${index + 1}. ${escapeHtml(step.title)}</strong><br />
          <span style="color:#5c6b64;">${escapeHtml(step.description)}</span>
        </li>`,
    )
    .join("");

  const stepsText = postTrainingSteps
    .map((step, index) => `${index + 1}. ${step.title} — ${step.description}`)
    .join("\n");

  const sessionHtml = [course, session].filter(Boolean).length
    ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
        ${course ? `<strong>Course:</strong> ${escapeHtml(course)}<br />` : ""}
        ${session ? `<strong>Session:</strong> ${escapeHtml(session)}` : ""}
      </p>`
    : "";

  const zoomHtml = input.zoomUrl?.trim()
    ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">
        Zoom: <a href="${escapeHtml(input.zoomUrl.trim())}" style="color:#0f6b4a;">${escapeHtml(input.zoomUrl.trim())}</a>
      </p>`
    : "";

  const html = `
    <div style="font-family:Georgia,serif;background:#e8f5ef;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px;border:1px solid #d5e6de;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#0f6b4a;font-weight:700;">AfriGrow Hub</p>
        <h1 style="margin:8px 0 0;font-size:22px;color:#0a4d35;">Next steps, ${escapeHtml(name)}</h1>
        <p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:#1a1a1a;">${escapeHtml(intro)}</p>
        ${sessionHtml}
        ${zoomHtml}
        <ol style="margin:16px 0 0;padding-left:20px;">${stepsHtml}</ol>
        <p style="margin:24px 0 0;">
          <a href="${escapeHtml(afterSession ? dashboardUrl : checklistUrl)}" style="display:inline-block;background:#0f6b4a;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:14px;font-weight:700;">Open the checklist</a>
        </p>
        <p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#1a1a1a;">
          Stuck? Reply to this email or write to ${escapeHtml(siteContact.email)}.
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#5c6b64;">AfriGrow Hub · www.afrigrow.app</p>
      </div>
    </div>`;

  const text = [
    `Next steps, ${name}`,
    "",
    intro,
    course ? `Course: ${course}` : "",
    session ? `Session: ${session}` : "",
    input.zoomUrl?.trim() ? `Zoom: ${input.zoomUrl.trim()}` : "",
    "",
    stepsText,
    "",
    `Checklist: ${checklistUrl}`,
    `In your dashboard: ${dashboardUrl}`,
    "",
    `Stuck? Reply to this email or write to ${siteContact.email}.`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return sendEmail({
    to,
    subject,
    html,
    text,
    replyTo,
  });
}
