/** Emails seeded in platform_admin_allowlist — merged with PLATFORM_ADMIN_EMAILS from env. */
export const PLATFORM_ADMIN_EMAILS_FALLBACK = [
  "ojuroyeolu@gmail.com",
  "ojuroye@hotmail.com",
] as const;

export function parseAdminEmails(): string[] {
  const fromEnv = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().replace(/^['"]|['"]$/g, "").toLowerCase())
    .filter(Boolean);

  return [...new Set([...fromEnv, ...PLATFORM_ADMIN_EMAILS_FALLBACK])];
}

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails().includes(email.trim().toLowerCase());
}
