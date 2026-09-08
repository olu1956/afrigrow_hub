/** Canonical public site URL (no trailing slash). Used for auth redirects, sitemap, OG. */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  let raw = configured || "";

  // Never ship password-reset / auth emails to localhost from a live deploy.
  if (!raw || (isProd && /localhost|127\.0\.0\.1/i.test(raw))) {
    if (vercel) {
      raw = vercel;
    } else if (isProd) {
      raw = "https://www.afrigrow.app";
    } else {
      raw = "http://localhost:3000";
    }
  }

  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  return raw.replace(/\/$/, "");
}

/** Prefer the browser origin when the client passes it (most reliable for auth emails). */
export function resolveAuthSiteUrl(clientOrigin?: string): string {
  const origin = clientOrigin?.trim().replace(/\/$/, "");
  if (origin && /^https?:\/\//i.test(origin) && !/localhost|127\.0\.0\.1/i.test(origin)) {
    return origin;
  }
  return getSiteUrl();
}

export function getAuthCallbackUrl(next?: string, clientOrigin?: string): string {
  const base = `${resolveAuthSiteUrl(clientOrigin)}/auth/callback`;
  if (!next) return base;
  return `${base}?next=${encodeURIComponent(next)}`;
}
