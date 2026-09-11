"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { ENTERPRISE_ENQUIRIES_TABLE } from "@/lib/database/enterprise-enquiries";
import { FOLLOW_UP_MESSAGES_TABLE } from "@/lib/database/follow-up-messages";
import { FUNDING_PROFILES_TABLE } from "@/lib/database/funding-profiles";
import { INVOICES_TABLE } from "@/lib/database/invoices";
import { LEADS_TABLE } from "@/lib/database/leads";
import { MARKETING_CAMPAIGNS_TABLE } from "@/lib/database/marketing-campaigns";
import { MARKETPLACE_MATCHES_TABLE } from "@/lib/database/marketplace-matches";
import { PAIN_POINT_REPORTS_TABLE } from "@/lib/database/pain-point-reports";
import { QUOTATIONS_TABLE } from "@/lib/database/quotations";
import { SUBSCRIPTIONS_TABLE } from "@/lib/database/subscriptions";
import { TRAINING_ENROLLMENTS_TABLE } from "@/lib/database/training-enrollments";
import { USERS_PROFILE_TABLE } from "@/lib/database/users-profile";
import { VERIFICATION_REQUESTS_TABLE } from "@/lib/database/verification-requests";
import { isBusinessListed } from "@/lib/directory/listing-status";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AccountPrivacyResult = {
  ok: boolean;
  error?: string;
};

export type AccountPrivacySettings = AccountPrivacyResult & {
  listed?: boolean;
  directoryOptOut?: boolean;
  directoryHiddenByAdmin?: boolean;
  profileScore?: number | null;
};

export type AccountExportResult = AccountPrivacyResult & {
  filename?: string;
  payload?: string;
};

function missingRpcOrColumn(message: string): boolean {
  return (
    /Could not find the function/i.test(message) ||
    /function .* does not exist/i.test(message) ||
    /schema cache/i.test(message) ||
    /directory_opt_out/i.test(message)
  );
}

function setupWarning(): string {
  return "Privacy controls are not set up yet. Run supabase/scripts/setup_member_privacy_and_verification.sql in the Supabase SQL Editor.";
}

async function rowsForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  userId: string,
): Promise<unknown[]> {
  const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);
  if (error) return [];
  return data ?? [];
}

export async function getAccountPrivacySettingsAction(): Promise<AccountPrivacySettings> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, listed: false, directoryOptOut: false, directoryHiddenByAdmin: false, profileScore: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("business_name, profile_score, directory_hidden, directory_opt_out")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (/directory_opt_out/i.test(error.message)) {
      const fallback = await supabase
        .from(BUSINESSES_TABLE)
        .select("business_name, profile_score, directory_hidden")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fallback.error) {
        return { ok: false, error: fallback.error.message };
      }

      const listed = isBusinessListed({
        businessName: fallback.data?.business_name,
        profileScore: fallback.data?.profile_score,
        directoryHidden: Boolean(
          (fallback.data as { directory_hidden?: boolean } | null)?.directory_hidden,
        ),
        directoryOptOut: false,
      });

      return {
        ok: true,
        listed,
        directoryOptOut: false,
        directoryHiddenByAdmin: Boolean(
          (fallback.data as { directory_hidden?: boolean } | null)?.directory_hidden,
        ),
        profileScore:
          typeof fallback.data?.profile_score === "number" ? fallback.data.profile_score : null,
      };
    }

    return { ok: false, error: error.message };
  }

  const directoryHiddenByAdmin = Boolean(
    (data as { directory_hidden?: boolean } | null)?.directory_hidden,
  );
  const directoryOptOut = Boolean(
    (data as { directory_opt_out?: boolean } | null)?.directory_opt_out,
  );
  const listed = isBusinessListed({
    businessName: data?.business_name,
    profileScore: data?.profile_score,
    directoryHidden: directoryHiddenByAdmin,
    directoryOptOut,
  });

  return {
    ok: true,
    listed,
    directoryOptOut,
    directoryHiddenByAdmin,
    profileScore: typeof data?.profile_score === "number" ? data.profile_score : null,
  };
}

export async function setDirectoryOptOutAction(optOut: boolean): Promise<AccountPrivacyResult> {
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

  const { error: rpcError } = await supabase.rpc("set_own_directory_opt_out", {
    p_opt_out: optOut,
  });

  if (!rpcError) {
    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/profile");
    return { ok: true };
  }

  if (!missingRpcOrColumn(rpcError.message) && !/not authorized/i.test(rpcError.message)) {
    return { ok: false, error: rpcError.message };
  }

  const { error } = await supabase
    .from(BUSINESSES_TABLE)
    .update({ directory_opt_out: optOut })
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: missingRpcOrColumn(error.message) ? setupWarning() : error.message };
  }

  revalidatePath("/dashboard/directory");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

export async function exportAccountDataAction(): Promise<AccountExportResult> {
  if (!isSupabaseAuthEnabled()) {
    return {
      ok: true,
      filename: `afrigrow-data-preview-${new Date().toISOString().slice(0, 10)}.json`,
      payload: JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          note: "Preview mode — no server account. Export includes only this browser session after you save a profile.",
        },
        null,
        2,
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const [
    profile,
    businesses,
    campaigns,
    matches,
    leads,
    followUps,
    reports,
    funding,
    invoices,
    quotations,
    subscriptions,
    enrollments,
    verification,
    enquiries,
  ] = await Promise.all([
    rowsForUser(supabase, USERS_PROFILE_TABLE, user.id),
    rowsForUser(supabase, BUSINESSES_TABLE, user.id),
    rowsForUser(supabase, MARKETING_CAMPAIGNS_TABLE, user.id),
    rowsForUser(supabase, MARKETPLACE_MATCHES_TABLE, user.id),
    rowsForUser(supabase, LEADS_TABLE, user.id),
    rowsForUser(supabase, FOLLOW_UP_MESSAGES_TABLE, user.id),
    rowsForUser(supabase, PAIN_POINT_REPORTS_TABLE, user.id),
    rowsForUser(supabase, FUNDING_PROFILES_TABLE, user.id),
    rowsForUser(supabase, INVOICES_TABLE, user.id),
    rowsForUser(supabase, QUOTATIONS_TABLE, user.id),
    rowsForUser(supabase, SUBSCRIPTIONS_TABLE, user.id),
    rowsForUser(supabase, TRAINING_ENROLLMENTS_TABLE, user.id),
    rowsForUser(supabase, VERIFICATION_REQUESTS_TABLE, user.id),
    rowsForUser(supabase, ENTERPRISE_ENQUIRIES_TABLE, user.id),
  ]);

  const payload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email ?? "",
        createdAt: user.created_at,
      },
      profile,
      businesses,
      marketingCampaigns: campaigns,
      marketplaceMatches: matches,
      crmLeads: leads,
      followUpMessages: followUps,
      growthReports: reports,
      fundingProfiles: funding,
      invoices,
      quotations,
      subscriptions,
      trainingEnrollments: enrollments,
      verificationRequests: verification,
      contactEnquiries: enquiries,
    },
    null,
    2,
  );

  return {
    ok: true,
    filename: `afrigrow-data-${new Date().toISOString().slice(0, 10)}.json`,
    payload,
  };
}

export async function deleteOwnAccountAction(confirmation: string): Promise<AccountPrivacyResult> {
  if (confirmation.trim().toUpperCase() !== "DELETE") {
    return { ok: false, error: "Type DELETE to confirm account deletion." };
  }

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

  const { error: rpcError } = await supabase.rpc("delete_own_account");
  if (!rpcError) {
    await supabase.auth.signOut();
    revalidatePath("/");
    return { ok: true };
  }

  const adminClient = createAdminClient();
  if (adminClient) {
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return { ok: false, error: deleteError.message };
    }
    await supabase.auth.signOut();
    revalidatePath("/");
    return { ok: true };
  }

  if (missingRpcOrColumn(rpcError.message)) {
    return { ok: false, error: setupWarning() };
  }

  return { ok: false, error: rpcError.message };
}
