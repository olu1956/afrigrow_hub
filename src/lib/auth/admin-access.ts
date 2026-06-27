import type { User } from "@supabase/supabase-js";
import { isPlatformAdminEmail } from "@/lib/auth/admin-emails";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { PLATFORM_ADMIN_ALLOWLIST_TABLE } from "@/lib/database/platform-admin";
import { USERS_PROFILE_TABLE } from "@/lib/database/users-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PlatformAdminGate = {
  allowed: boolean;
  authEmail: string;
  reason?: "not_logged_in" | "not_admin";
};

function normalizeEmail(email: string | null | undefined): string | null {
  const normalized = email?.trim().toLowerCase();
  return normalized || null;
}

function addEmail(target: Set<string>, email: string | null | undefined): void {
  const normalized = normalizeEmail(email);
  if (normalized) target.add(normalized);
}

function addEmailsFromAuthUser(target: Set<string>, user: User | null | undefined): void {
  if (!user) return;

  addEmail(target, user.email);
  addEmail(target, user.user_metadata?.email as string | undefined);

  for (const identity of user.identities ?? []) {
    addEmail(target, identity.identity_data?.email as string | undefined);
  }
}

async function collectAdminCandidateEmails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  authEmail?: string | null,
  authUser?: User | null,
): Promise<{ emails: string[]; role: string | null }> {
  const emails = new Set<string>();
  addEmail(emails, authEmail);
  addEmailsFromAuthUser(emails, authUser ?? null);

  const adminClient = createAdminClient();
  if (adminClient) {
    const { data: authData } = await adminClient.auth.admin.getUserById(userId);
    addEmailsFromAuthUser(emails, authData.user);
  }

  const [{ data: profile }, { data: business }] = await Promise.all([
    supabase.from(USERS_PROFILE_TABLE).select("role, email").eq("user_id", userId).maybeSingle(),
    supabase
      .from(BUSINESSES_TABLE)
      .select("email")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  addEmail(emails, profile?.email);
  addEmail(emails, business?.email);

  return {
    emails: [...emails],
    role: profile?.role ?? null,
  };
}

async function isEmailOnAllowlist(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const { data, error } = await supabase
    .from(PLATFORM_ADMIN_ALLOWLIST_TABLE)
    .select("email")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

async function isAnyEmailOnAllowlistViaServiceRole(emails: string[]): Promise<boolean> {
  const adminClient = createAdminClient();
  if (!adminClient || emails.length === 0) {
    return false;
  }

  const { data, error } = await adminClient.from(PLATFORM_ADMIN_ALLOWLIST_TABLE).select("email");

  if (error) {
    return false;
  }

  const allowlist = new Set(
    (data ?? [])
      .map((row) => normalizeEmail(row.email))
      .filter((email): email is string => Boolean(email)),
  );
  return emails.some((email) => allowlist.has(email));
}

async function isPlatformAdminViaRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<boolean | null> {
  const { data, error } = await supabase.rpc("is_platform_admin");

  if (error) {
    return null;
  }

  return data === true;
}

export async function isPlatformAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email?: string | null,
  authUser?: User | null,
): Promise<boolean> {
  const { emails, role } = await collectAdminCandidateEmails(
    supabase,
    userId,
    email,
    authUser,
  );

  if (role === "admin") {
    return true;
  }

  for (const candidate of emails) {
    if (isPlatformAdminEmail(candidate)) {
      return true;
    }
  }

  const rpcAdmin = await isPlatformAdminViaRpc(supabase);
  if (rpcAdmin === true) {
    return true;
  }

  for (const candidate of emails) {
    if (await isEmailOnAllowlist(supabase, candidate)) {
      return true;
    }
  }

  if (await isAnyEmailOnAllowlistViaServiceRole(emails)) {
    return true;
  }

  return false;
}

export async function getPlatformAdminGate(): Promise<PlatformAdminGate> {
  if (!isSupabaseAuthEnabled()) {
    return { allowed: true, authEmail: "" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, authEmail: "", reason: "not_logged_in" };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);

  return {
    allowed: isAdmin,
    authEmail: user.email ?? "",
    reason: isAdmin ? undefined : "not_admin",
  };
}

export { isPlatformAdminEmail } from "@/lib/auth/admin-emails";
