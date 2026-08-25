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

export function isBillingMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function billingMailFromAddress(): string {
  return (
    process.env.BILLING_FROM_EMAIL?.trim() ||
    "AfriGrow Hub <billing@afrigrow.app>"
  );
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Email sending is not configured. Add RESEND_API_KEY in Vercel (and .env.local), then redeploy.",
    };
  }

  const payload: Record<string, unknown> = {
    from: billingMailFromAddress(),
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
  };

  if (input.replyTo) payload.reply_to = input.replyTo;
  if (input.bcc && input.bcc.toLowerCase() !== input.to.toLowerCase()) {
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
        body?.message ||
        `Could not send email (${response.status}). Check the Resend domain and FROM address.`,
    };
  }

  return { ok: true };
}
