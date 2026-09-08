import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Set new password — AfriGrow Hub",
  description: "Choose a new password for your AfriGrow Hub account.",
};

export default function UpdatePasswordPage() {
  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your AfriGrow Hub account."
    >
      <UpdatePasswordForm />
    </AuthLayout>
  );
}
