#!/usr/bin/env node
/**
 * Local admin diagnostic — run: node scripts/check-platform-admin.mjs
 * Loads .env.local and checks allowlist + env config (no secrets printed).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.log("Missing .env.local");
    process.exit(1);
  }
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmails = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

console.log("PLATFORM_ADMIN_EMAILS count:", adminEmails.length);
console.log("Admin emails configured:", adminEmails.join(", ") || "(none)");
console.log("Service role key present:", Boolean(serviceKey));

if (!url || !serviceKey) {
  console.log("\nNeed NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for DB checks.");
  process.exit(0);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: allowlist, error: allowlistError } = await admin
  .from("platform_admin_allowlist")
  .select("email");

if (allowlistError) {
  console.log("\nAllowlist error:", allowlistError.message);
} else {
  console.log("\nAllowlist emails:", (allowlist ?? []).map((r) => r.email).join(", ") || "(empty)");
}

const { data: authUsers, error: authError } = await admin.auth.admin.listUsers({ perPage: 20 });

if (authError) {
  console.log("\nAuth users error:", authError.message);
} else {
  console.log("\nRecent auth users:");
  for (const user of authUsers?.users ?? []) {
    const email = (user.email ?? "").toLowerCase();
    const envMatch = adminEmails.includes(email);
    const allowMatch = (allowlist ?? []).some((r) => r.email.toLowerCase() === email);
    console.log(`  - ${user.email} | env:${envMatch ? "yes" : "no"} allowlist:${allowMatch ? "yes" : "no"}`);
  }
}

const { data: profiles } = await admin.from("users_profile").select("email, role, user_id");
console.log("\nusers_profile roles:");
for (const row of profiles ?? []) {
  console.log(`  - ${row.email} | role:${row.role}`);
}
