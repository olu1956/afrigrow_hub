"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { USERS_PROFILE_TABLE } from "@/lib/database/users-profile";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { getAuthCallbackUrl } from "@/lib/site-url";

export type AuthResult = {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
};

export async function signUpAction(input: {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  businessType: string;
  country: string;
}): Promise<AuthResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        business_name: input.businessName,
        business_type: input.businessType,
        country: input.country,
      },
      emailRedirectTo: getAuthCallbackUrl(),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data.user) {
    await supabase.from(USERS_PROFILE_TABLE).upsert(
      {
        user_id: data.user.id,
        full_name: input.fullName,
        email: input.email,
        country: input.country,
        role: "owner",
      },
      { onConflict: "user_id" },
    );

    await supabase.from(BUSINESSES_TABLE).upsert(
      {
        user_id: data.user.id,
        business_name: input.businessName,
        industry: input.businessType,
        country: input.country,
        email: input.email,
      },
      { onConflict: "user_id" },
    );
  }

  return {
    ok: true,
    needsEmailConfirmation: !data.session,
  };
}

export async function signInAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  if (!isSupabaseAuthEnabled()) return;

  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function resetPasswordAction(email: string): Promise<AuthResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthCallbackUrl("/login"),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
