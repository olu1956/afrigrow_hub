import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { notifyAdminsOfSignup } from "@/lib/mail/admin-notifications";
import { ensureMemberWelcomeEmail } from "@/lib/mail/member-welcome";
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
  const meta = (user.user_metadata as { welcome_email_sent?: boolean } | undefined) ?? {};
  return fromGoogle && meta.welcome_email_sent !== true;
}

async function notifyIfNewMember(user: User | null): Promise<void> {
  if (!user) return;

  const meta = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    business_name?: string;
  };
  const fullName = meta.full_name?.trim() || meta.name?.trim() || "there";
  const businessName = meta.business_name?.trim() || "your business";
  const email = user.email ?? "";

  try {
    const welcome = ensureMemberWelcomeEmail(user, {
      fullName,
      businessName,
      email,
    });

    const adminAlert = isFreshGoogleSignup(user)
      ? notifyAdminsOfSignup({
          fullName,
          businessName: businessName === "your business" ? "Untitled business" : businessName,
          email,
          source: "google",
        })
      : Promise.resolve();

    await Promise.all([welcome, adminAlert]);
  } catch (notifyError) {
    console.error(
      "New-member notification emails failed:",
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
      await notifyIfNewMember(user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
