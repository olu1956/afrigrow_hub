import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign up free — Early Access",
  description:
    "Create your free AfriGrow Hub account during early access. No credit card required.",
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Join free — early access"
      subtitle="Create your business account in minutes. No credit card required during the test period."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
