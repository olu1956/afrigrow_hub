"use server";

import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { isPlatformAdminUser } from "@/lib/auth/admin-access";
import { sessionFromUser } from "@/lib/auth/session";
import { getPlanById, type PlanId } from "@/lib/billing-data";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { SUBSCRIPTIONS_TABLE, type Subscription } from "@/lib/database/subscriptions";
import { USERS_PROFILE_TABLE } from "@/lib/database/users-profile";
import { createClient } from "@/lib/supabase/server";
import type { SessionPreview } from "@/lib/session-preview";

export type AuthSessionData = {
  session: SessionPreview;
  userId: string;
  isPlatformAdmin: boolean;
  authEmail: string;
};

export async function getSessionDataAction(): Promise<AuthSessionData | null> {
  if (!isSupabaseAuthEnabled()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: business }, { data: subscription, error: subscriptionError }] =
    await Promise.all([
    supabase.from(USERS_PROFILE_TABLE).select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from(BUSINESSES_TABLE)
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from(SUBSCRIPTIONS_TABLE).select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const session = sessionFromUser(user, profile, business);

  if (!subscriptionError && subscription?.plan) {
    session.plan = getPlanById(subscription.plan as PlanId).name;
  }

  const isPlatformAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);

  return {
    userId: user.id,
    session,
    isPlatformAdmin,
    authEmail: user.email ?? "",
  };
}
