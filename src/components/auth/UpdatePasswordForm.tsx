"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { updatePasswordAction } from "@/lib/auth/actions";
import {
  type FieldErrors,
  validatePassword,
  validatePasswordMatch,
} from "@/lib/auth-validation";
import { useSession } from "@/components/providers/SessionProvider";

export function UpdatePasswordForm() {
  const router = useRouter();
  const { authEnabled } = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: FieldErrors = {};
    const passwordError = validatePassword(password);
    const matchError = validatePasswordMatch(password, confirm);
    if (passwordError) nextErrors.password = passwordError;
    if (matchError) nextErrors.confirmPassword = matchError;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setFormError(null);
    setLoading(true);

    if (authEnabled) {
      const result = await updatePasswordAction(password);
      if (!result.ok) {
        setFormError(result.error ?? "Unable to update password.");
        setLoading(false);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 400));
    }

    setLoading(false);
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {formError}{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            Request a new reset link
          </Link>
        </p>
      ) : null}

      <PasswordInput
        label="New password"
        name="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      <PasswordInput
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={errors.confirmPassword}
      />

      <AuthButton loading={loading}>Update password</AuthButton>
    </form>
  );
}
