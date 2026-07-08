import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign up free — Founding Member",
  description:
    "Create your free AfriGrow Hub founding-member account. No credit card required during early access.",
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Join free — founding member"
      subtitle="Create your business account in minutes. Founding membership is free — no credit card required."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
