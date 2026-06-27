"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import {
  mapSubscription,
  type SubscriptionView,
} from "@/lib/billing/subscription-mapper";
import type { PlanId } from "@/lib/billing-data";
import {
  SUBSCRIPTIONS_TABLE,
  type Subscription,
} from "@/lib/database/subscriptions";
import { createClient } from "@/lib/supabase/server";

export type SubscriptionActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type SubscriptionResult = SubscriptionActionResult & {
  subscription?: SubscriptionView;
};

function isMissingTableError(message: string): boolean {
  return /subscriptions|schema cache|relation .* does not exist/i.test(message);
}

function formatSubscriptionDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Run migration 20260620230000_create_subscriptions.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

export async function getSubscriptionAction(): Promise<SubscriptionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) {
      return { ok: true, warning: formatSubscriptionDbError(error.message) };
    }

    return { ok: false, error: formatSubscriptionDbError(error.message) };
  }

  if (!data) {
    return { ok: true };
  }

  return {
    ok: true,
    subscription: mapSubscription(data as Subscription),
  };
}

export async function updateSubscriptionPlanAction(input: {
  planId: PlanId;
}): Promise<SubscriptionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  if (input.planId === "enterprise") {
    return {
      ok: false,
      error: "Contact sales to upgrade to Enterprise.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select("provider, provider_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: formatSubscriptionDbError(fetchError.message) };
  }

  const provider = existing?.provider ?? "preview";
  const providerCustomerId = existing?.provider_customer_id ?? "";

  const { data, error } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .upsert(
      {
        user_id: user.id,
        plan: input.planId,
        status: "active",
        provider,
        provider_customer_id: providerCustomerId,
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatSubscriptionDbError(error.message) };
  }

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");

  return {
    ok: true,
    subscription: mapSubscription(data as Subscription),
  };
}
