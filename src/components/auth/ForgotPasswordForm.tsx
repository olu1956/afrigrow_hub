"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { type FieldErrors, validateEmail } from "@/lib/auth-validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
          <MailCheck className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-foreground">Check your inbox</h2>
        <p className="mt-2 text-sm text-muted">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{email}</span>, we&apos;ve
          sent password reset instructions. (Preview — no email sent yet.)
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <AuthInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@yourbusiness.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        hint="We'll send a reset link to this address."
      />

      <AuthButton loading={loading}>Send reset link</AuthButton>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to log in
      </Link>
    </form>
  );
}
