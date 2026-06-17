import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign up — AfriGrow Hub",
  description: "Create your AfriGrow Hub account and start growing your business.",
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Join AfriGrow Hub"
      subtitle="Create your free business account and start growing with AI agents."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
