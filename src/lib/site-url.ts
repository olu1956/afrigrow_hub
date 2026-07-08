/** Canonical public site URL (no trailing slash). Used for auth redirects, sitemap, OG. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function getAuthCallbackUrl(next?: string): string {
  const base = `${getSiteUrl()}/auth/callback`;
  if (!next) return base;
  return `${base}?next=${encodeURIComponent(next)}`;
}
