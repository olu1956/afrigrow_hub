"use server";

import { revalidatePath } from "next/cache";
import { isPlatformAdminUser } from "@/lib/auth/admin-access";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE, type Business } from "@/lib/database/businesses";
import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminDirectoryBusiness = {
  id: string;
  userId: string;
  businessName: string;
  industry: string;
  city: string;
  country: string;
  email: string;
  profileScore: number;
  directoryHidden: boolean;
  listed: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminDirectoryActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type AdminDirectoryListResult = AdminDirectoryActionResult & {
  businesses?: AdminDirectoryBusiness[];
};

function isMissingDirectoryHiddenColumn(message: string): boolean {
  return (
    /column ["']?directory_hidden["']? does not exist/i.test(message) ||
    /Could not find the ['"]directory_hidden['"] column/i.test(message)
  );
}

function isMissingRpc(message: string): boolean {
  return (
    /Could not find the function/i.test(message) ||
    /function .* does not exist/i.test(message) ||
    /schema cache/i.test(message)
  );
}

function mapBusiness(row: Business & { directory_hidden?: boolean | null }): AdminDirectoryBusiness {
  const rawName = row.business_name?.trim() || "";
  const businessName = rawName || "Untitled business";
  const profileScore = typeof row.profile_score === "number" ? row.profile_score : 0;
  const directoryHidden = Boolean(row.directory_hidden);
  const listed =
    Boolean(rawName) &&
    profileScore >= DIRECTORY_MIN_PROFILE_SCORE &&
    !directoryHidden;

  return {
    id: row.id,
    userId: row.user_id,
    businessName,
    industry: row.industry?.trim() || "",
    city: row.city?.trim() || "",
    country: row.country?.trim() || "",
    email: row.email?.trim() || "",
    profileScore,
    directoryHidden,
    listed,
    isVerified: Boolean(row.is_verified),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertPlatformAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "You must be logged in." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  if (!isAdmin) {
    return { ok: false as const, error: "You do not have access to this admin area." };
  }

  return { ok: true as const, supabase, user };
}

function moderationSetupWarning(): string {
  return "Directory moderation RPCs are missing. Re-run supabase/scripts/setup_directory_moderation.sql in the Supabase SQL Editor, then try again.";
}

function formatModerationError(message: string): string {
  if (/not authorized/i.test(message)) {
    return "Not authorized in the database. Run supabase/scripts/promote_platform_admin.sql with your login email, then try again.";
  }
  if (isMissingDirectoryHiddenColumn(message) || isMissingRpc(message)) {
    return moderationSetupWarning();
  }
  return message;
}

export async function getAdminDirectoryBusinessesAction(): Promise<AdminDirectoryListResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const adminClient = createAdminClient();
  const queryClient = adminClient ?? auth.supabase;

  const { data, error } = await queryClient
    .from(BUSINESSES_TABLE)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingDirectoryHiddenColumn(error.message)) {
      const fallback = await queryClient
        .from(BUSINESSES_TABLE)
        .select("*")
        .order("updated_at", { ascending: false });

      if (fallback.error) {
        return { ok: false, error: fallback.error.message };
      }

      return {
        ok: true,
        businesses: ((fallback.data ?? []) as Business[]).map((row) =>
          mapBusiness({ ...row, directory_hidden: false }),
        ),
        warning: moderationSetupWarning(),
      };
    }

    return { ok: false, error: error.message };
  }

  const businesses = ((data ?? []) as Business[]).map(mapBusiness);

  if (businesses.length === 0 && !adminClient) {
    return {
      ok: true,
      businesses: [],
      warning:
        "No businesses visible with your session. Add SUPABASE_SERVICE_ROLE_KEY for full admin moderation, or confirm platform admin access.",
    };
  }

  return { ok: true, businesses };
}

export async function setDirectoryHiddenAction(input: {
  businessId: string;
  hidden: boolean;
}): Promise<AdminDirectoryActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const businessId = input.businessId.trim();
  if (!businessId) {
    return { ok: false, error: "Missing business id." };
  }

  // 1) Preferred: security-definer RPC (works without service role when DB admin is set).
  const { data: rpcRow, error: rpcError } = await auth.supabase.rpc(
    "admin_set_directory_hidden",
    {
      p_business_id: businessId,
      p_hidden: input.hidden,
    },
  );

  if (!rpcError) {
    const hidden = Boolean(
      (rpcRow as { directory_hidden?: boolean } | null)?.directory_hidden ?? input.hidden,
    );
    if (hidden !== input.hidden) {
      return {
        ok: false,
        error: "Unlist did not apply. Re-run setup_directory_moderation.sql and try again.",
      };
    }
    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/admin/directory");
    return { ok: true };
  }

  const canFallback =
    isMissingRpc(rpcError.message) || /not authorized/i.test(rpcError.message);
  if (!canFallback) {
    return { ok: false, error: formatModerationError(rpcError.message) };
  }

  // 2) Service-role update (bypasses RLS) — verify a row was returned.
  const adminClient = createAdminClient();
  if (adminClient) {
    const { data, error } = await adminClient
      .from(BUSINESSES_TABLE)
      .update({ directory_hidden: input.hidden })
      .eq("id", businessId)
      .select("id, directory_hidden")
      .maybeSingle();

    if (error) {
      return { ok: false, error: formatModerationError(error.message) };
    }
    if (!data) {
      return { ok: false, error: "Business not found." };
    }
    if (Boolean(data.directory_hidden) !== input.hidden) {
      return { ok: false, error: "Unlist did not apply in the database." };
    }

    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/admin/directory");
    return { ok: true };
  }

  // 3) Direct update — must select + verify (RLS can silently update 0 rows).
  const { data, error } = await auth.supabase
    .from(BUSINESSES_TABLE)
    .update({ directory_hidden: input.hidden })
    .eq("id", businessId)
    .select("id, directory_hidden")
    .maybeSingle();

  if (error) {
    return { ok: false, error: formatModerationError(error.message || rpcError.message) };
  }

  if (!data) {
    return {
      ok: false,
      error: formatModerationError(rpcError.message || "not authorized"),
    };
  }

  if (Boolean(data.directory_hidden) !== input.hidden) {
    return { ok: false, error: "Unlist did not apply in the database." };
  }

  revalidatePath("/dashboard/directory");
  revalidatePath("/dashboard/admin/directory");
  return { ok: true };
}

export async function removeDirectoryBusinessAction(input: {
  businessId: string;
}): Promise<AdminDirectoryActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const auth = await assertPlatformAdmin();
  if (!auth.ok) {
    return { ok: false, error: auth.error };
  }

  const businessId = input.businessId.trim();
  if (!businessId) {
    return { ok: false, error: "Missing business id." };
  }

  // Load target first (for self-delete guard + existence check).
  const adminClient = createAdminClient();
  const reader = adminClient ?? auth.supabase;
  const { data: business, error: loadError } = await reader
    .from(BUSINESSES_TABLE)
    .select("id, user_id, business_name")
    .eq("id", businessId)
    .maybeSingle();

  if (loadError) {
    return { ok: false, error: loadError.message };
  }
  if (!business) {
    return { ok: false, error: "Business not found." };
  }
  if (business.user_id === auth.user.id) {
    return { ok: false, error: "You cannot remove your own admin account from here." };
  }

  // 1) Preferred: security-definer RPC deletes auth.users (cascades business).
  const { error: rpcError } = await auth.supabase.rpc("admin_remove_directory_business", {
    p_business_id: businessId,
  });

  if (!rpcError) {
    const { data: stillThere } = await reader
      .from(BUSINESSES_TABLE)
      .select("id")
      .eq("id", businessId)
      .maybeSingle();

    if (stillThere) {
      return {
        ok: false,
        error: "Remove reported success but the business is still present. Check Supabase logs.",
      };
    }

    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/admin/directory");
    return { ok: true };
  }

  // 2) Fallback: Auth Admin API via service role.
  if (adminClient) {
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(business.user_id);
    if (deleteUserError) {
      return { ok: false, error: formatModerationError(deleteUserError.message) };
    }

    revalidatePath("/dashboard/directory");
    revalidatePath("/dashboard/admin/directory");
    return { ok: true };
  }

  return {
    ok: false,
    error: formatModerationError(rpcError.message),
  };
}
