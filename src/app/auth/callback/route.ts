import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { notifyAdminsOfSignup } from "@/lib/mail/admin-notifications";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

function isFreshGoogleSignup(user: User): boolean {
  const created = Date.parse(user.created_at);
  if (!Number.isFinite(created) || Date.now() - created > 10 * 60 * 1000) {
    return false;
  }

  const fromGoogle = (user.identities ?? []).some(
    (identity) => identity.provider === "google",
  );
  const meta = (user.user_metadata ?? {}) as { business_name?: string };
  return fromGoogle && !meta.business_name?.trim();
}

async function notifyIfFreshGoogleSignup(user: User | null): Promise<void> {
  if (!user || !isFreshGoogleSignup(user)) return;

  const meta = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
  };

  try {
    await notifyAdminsOfSignup({
      fullName: meta.full_name?.trim() || meta.name?.trim() || "Google user",
      businessName: "Untitled business",
      email: user.email ?? "",
      source: "google",
    });
  } catch (notifyError) {
    console.error(
      "Google signup admin notification failed:",
      notifyError instanceof Error ? notifyError.message : notifyError,
    );
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await notifyIfFreshGoogleSignup(user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
