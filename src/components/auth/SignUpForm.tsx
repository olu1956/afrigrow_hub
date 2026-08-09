"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { signUpAction } from "@/lib/auth/actions";
import { CountrySelect } from "@/components/dashboard/CountrySelect";
import {
  type FieldErrors,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} from "@/lib/auth-validation";
import { useSession } from "@/components/providers/SessionProvider";
import { FREE_LAUNCH_CTA_LINE } from "@/lib/product-messaging";

const businessTypes = [
  { value: "", label: "Select business type" },
  { value: "retail", label: "Retail & trading" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "food", label: "Food & hospitality" },
  { value: "events", label: "Events & entertainment" },
  { value: "tech", label: "Tech & digital" },
  { value: "other", label: "Other" },
];

export function SignUpForm() {
  const router = useRouter();
  const { setSession, refreshSession, authEnabled } = useSession();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  function validate() {
    const next: FieldErrors = {};
    const fullNameError = validateRequired(fullName, "Full name");
    const businessNameError = validateRequired(businessName, "Business name");
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validatePasswordMatch(password, confirmPassword);

    if (fullNameError) next.fullName = fullNameError;
    if (businessNameError) next.businessName = businessNameError;
    if (!businessType) next.businessType = "Select your business type";
    if (!country) next.country = "Select your country";
    if (emailError) next.email = emailError;
    if (passwordError) next.password = passwordError;
    if (confirmError) next.confirmPassword = confirmError;
    if (!acceptedTerms) next.terms = "You must accept the terms to continue";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFormError(null);

    const payload = {
      owner: fullName.trim(),
      name: businessName.trim(),
      email: email.trim(),
      businessType,
      country,
      location: country,
    };

    if (authEnabled) {
      const result = await signUpAction({
        email: payload.email,
        password,
        fullName: payload.owner,
        businessName: payload.name,
        businessType: payload.businessType,
        country: payload.country,
      });

      if (!result.ok) {
        setFormError(result.error ?? "Unable to create account. Please try again.");
        setLoading(false);
        return;
      }

      if (result.needsEmailConfirmation) {
        setNeedsConfirmation(true);
        setLoading(false);
        return;
      }

      // Persist registration identity immediately, then hard-navigate so the
      // session provider remounts with the new auth cookies.
      setSession(payload);
      await refreshSession();
      window.location.assign("/dashboard");
      return;
    }

    await new Promise((r) => setTimeout(r, 600));
    setSession(payload);
    setLoading(false);
    router.push("/dashboard");
  }

  if (needsConfirmation) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary-light p-6 text-center">
        <p className="font-semibold text-primary">Confirm your email</p>
        <p className="mt-2 text-sm text-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click it to
          activate your account, then log in.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Go to log in →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!authEnabled ? (
        <p className="rounded-xl border border-dashed border-border bg-primary-light/40 px-4 py-3 text-xs text-muted">
          Preview mode — add Supabase env vars to enable real registration.
        </p>
      ) : (
        <p className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-xs text-primary">
          {FREE_LAUNCH_CTA_LINE}
        </p>
      )}

      <SocialAuthButtons mode="signup" />
      <AuthDivider label="or register with email" />

      {formError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <AuthInput
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
        <AuthInput
          label="Business name"
          name="businessName"
          autoComplete="organization"
          placeholder="Your business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          error={errors.businessName}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="businessType" className="block text-sm font-medium text-foreground">
          Business type
        </label>
        <select
          id="businessType"
          name="businessType"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            errors.businessType ? "border-red-400" : "border-border"
          } ${!businessType ? "text-muted" : ""}`}
        >
          {businessTypes.map((type) => (
            <option key={type.value} value={type.value} disabled={!type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.businessType && (
          <p className="text-xs text-red-600" role="alert">
            {errors.businessType}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="country" className="block text-sm font-medium text-foreground">
          Country
        </label>
        <CountrySelect
          id="country"
          name="country"
          value={country}
          onChange={setCountry}
          required
          className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            errors.country ? "border-red-400" : "border-border"
          } ${!country ? "text-muted" : ""}`}
        />
        {errors.country && (
          <p className="text-xs text-red-600" role="alert">
            {errors.country}
          </p>
        )}
      </div>

      <AuthInput
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="hello@yourbusiness.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
      </div>

      <div className="space-y-1">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
          />
          <span>
            I agree to the{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-red-600" role="alert">
            {errors.terms}
          </p>
        )}
      </div>

      <AuthButton loading={loading}>Create account</AuthButton>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
