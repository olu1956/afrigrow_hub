export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  bcc?: string;
};

export type SendEmailResult =
  | { ok: true }
  | { ok: false; error: string };

const RESEND_API = "https://api.resend.com/emails";

/** Resend allows this from-address without a verified domain (deliver to the Resend account email only). */
const TEST_FROM = "AfriGrow Hub <onboarding@resend.dev>";

const BARE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAMED_EMAIL = /^.+\s<[^<>\s]+@[^<>\s]+\.[^<>\s]+>$/;
const CONSUMER_INBOX_HOSTS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
]);

function stripWrappers(value: string): string {
  return value.trim().replace(/^[`'"]+|[`'"]+$/g, "").trim();
}

function coerceFromAddress(value: string): string {
  const stripped = stripWrappers(value);
  if (!stripped) return "";

  const namedWithoutBrackets = stripped.match(
    /^(.+?)\s+([^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/,
  );
  if (namedWithoutBrackets && !stripped.includes("<")) {
    return `${namedWithoutBrackets[1].trim()} <${namedWithoutBrackets[2]}>`;
  }

  return stripped;
}

function isValidFromAddress(value: string): boolean {
  return BARE_EMAIL.test(value) || NAMED_EMAIL.test(value);
}

function fromHost(value: string): string | null {
  const named = value.match(/<([^>]+)>/);
  const email = (named?.[1] ?? value).trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1);
}

export function isBillingMailConfigured(): boolean {
  return Boolean(process.env["RESEND_API_KEY"]?.trim());
}

export function billingMailFromAddress(): string {
  const coerced = coerceFromAddress(process.env["BILLING_FROM_EMAIL"] ?? "");
  if (!coerced || !isValidFromAddress(coerced)) {
    return TEST_FROM;
  }

  const host = fromHost(coerced);
  if (!host || CONSUMER_INBOX_HOSTS.has(host) || host === "afrigrow.app") {
    return TEST_FROM;
  }

  return coerced;
}

function explainResendError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid `from`") || lower.includes("invalid from")) {
    return "The sender address in Vercel is invalid. Leave BILLING_FROM_EMAIL empty, or set it to: AfriGrow Hub <onboarding@resend.dev>";
  }

  if (lower.includes("not verified") || lower.includes("domain")) {
    return "Resend will not send from afrigrow.app until that domain is verified. Test mail now uses onboarding@resend.dev and can only reach the email you used to sign up for Resend.";
  }

  if (lower.includes("only send testing emails") || lower.includes("you can only send")) {
    return "Until send.afrigrow.app is verified in Resend, mail can only be delivered to the email you used to create your Resend account. Check that inbox and Spam.";
  }

  return message;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Email sending is not configured. Add RESEND_API_KEY in Vercel (and .env.local), then redeploy.",
    };
  }

  const from = billingMailFromAddress();
  const testingSender = from.toLowerCase().includes("onboarding@resend.dev");

  const payload: Record<string, unknown> = {
    from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
  };

  if (input.replyTo) payload.reply_to = input.replyTo;
  // Resend's test from-address rejects extra recipients (BCC/CC).
  if (
    !testingSender &&
    input.bcc &&
    input.bcc.toLowerCase() !== input.to.toLowerCase()
  ) {
    payload.bcc = [input.bcc];
  }

  const response = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null;

  if (!response.ok) {
    return {
      ok: false,
      error:
        explainResendError(
          body?.message ||
            `Could not send email (${response.status}). Check the Resend domain and FROM address.`,
        ),
    };
  }

  return { ok: true };
}
