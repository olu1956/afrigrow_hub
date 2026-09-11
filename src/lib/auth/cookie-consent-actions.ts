"use server";

import { cookies } from "next/headers";
import { trackSiteVisitAction } from "@/lib/auth/public-stats-actions";
import {
  COOKIE_CONSENT_COOKIE,
  VISITOR_COOKIE,
} from "@/lib/cookies/constants";

export type CookieConsentChoice = "essential" | "analytics";

export async function getCookieConsentAction(): Promise<CookieConsentChoice | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_CONSENT_COOKIE)?.value;
  if (value === "essential" || value === "analytics") return value;
  return null;
}

export async function setCookieConsentAction(
  choice: CookieConsentChoice,
): Promise<{ ok: true; choice: CookieConsentChoice }> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_CONSENT_COOKIE, choice, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  if (choice === "essential") {
    cookieStore.delete(VISITOR_COOKIE);
  } else {
    await trackSiteVisitAction();
  }

  return { ok: true, choice };
}
