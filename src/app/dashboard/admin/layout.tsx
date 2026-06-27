import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { getPlatformAdminGate } from "@/lib/auth/admin-access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const gate = await getPlatformAdminGate();

  if (!gate.allowed) {
    return <AdminAccessDenied authEmail={gate.authEmail} reason={gate.reason} />;
  }

  return children;
}
