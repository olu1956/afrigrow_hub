import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — AfriGrow Hub",
  description: "Sign in to your AfriGrow Hub account.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your business, agents, and growth tools."
    >
      <LoginForm />
    </AuthLayout>
  );
}
