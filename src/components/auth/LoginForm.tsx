"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import {
  type FieldErrors,
  validateEmail,
  validatePassword,
} from "@/lib/auth-validation";
import { useSession } from "@/components/providers/SessionProvider";
import { loadSessionPreview } from "@/lib/session-preview";

function ownerFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "User";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LoginForm() {
  const { setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const next: FieldErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) next.email = emailError;
    if (passwordError) next.password = passwordError;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const existing = loadSessionPreview();
    const trimmedEmail = email.trim();
    setSession({
      owner:
        existing.email === trimmedEmail ? existing.owner : ownerFromEmail(trimmedEmail),
      name:
        existing.email === trimmedEmail
          ? existing.name
          : `${ownerFromEmail(trimmedEmail)}'s Business`,
      email: trimmedEmail,
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary-light p-6 text-center">
        <p className="font-semibold text-primary">Sign-in preview complete</p>
        <p className="mt-2 text-sm text-muted">
          Authentication backend will be connected in a later phase. Dashboard
          shell is Module 3.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Preview dashboard →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <SocialAuthButtons mode="login" />
      <AuthDivider />

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
