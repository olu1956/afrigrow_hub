"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { sessionFromEmail } from "@/lib/auth/session";
import {
  type FieldErrors,
  validateEmail,
  validatePassword,
} from "@/lib/auth-validation";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const { setSession, authEnabled } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateValues(nextEmail: string, nextPassword: string) {
    const next: FieldErrors = {};
    const emailError = validateEmail(nextEmail);
    const passwordError = validatePassword(nextPassword);
    if (emailError) next.email = emailError;
    if (passwordError) next.password = passwordError;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const submittedEmail = String(formData.get("email") ?? "").trim();
    const submittedPassword = String(formData.get("password") ?? "");

    setEmail(submittedEmail);
    setPassword(submittedPassword);

    if (!validateValues(submittedEmail, submittedPassword)) return;

    setLoading(true);
    setFormError(null);

    if (authEnabled) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: submittedEmail,
          password: submittedPassword,
        });

        if (error) {
          setFormError(error.message);
          return;
        }

        window.location.assign(redirect);
      } catch {
        setFormError("Unable to sign in. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    await new Promise((r) => setTimeout(r, 600));
    const session = sessionFromEmail(submittedEmail);
    setSession(session);
    setLoading(false);
    router.push(redirect);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!authEnabled && (
        <p className="rounded-xl border border-dashed border-border bg-primary-light/40 px-4 py-3 text-xs text-muted">
          Preview mode — add Supabase env vars to enable real authentication.
        </p>
      )}

      <SocialAuthButtons mode="login" />
      <AuthDivider />

      {formError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}

      <AuthInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@yourbusiness.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <div className="space-y-2">
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <AuthButton loading={loading}>Log in</AuthButton>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up free
        </Link>
      </p>
    </form>
  );
}
