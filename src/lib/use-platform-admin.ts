"use client";

import { useEffect, useState } from "react";
import { isPlatformAdminEmail } from "@/lib/auth/admin-emails";
import { checkPlatformAdminAction } from "@/lib/auth/enterprise-enquiry-actions";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { useSession } from "@/components/providers/SessionProvider";
import { loadSessionPreview } from "@/lib/session-preview";

export function usePlatformAdmin(): { isAdmin: boolean; loading: boolean } {
  const { isPlatformAdmin, hydrated, authEnabled } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    if (authEnabled) {
      if (isPlatformAdmin) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      async function load() {
        const result = await checkPlatformAdminAction();
        setIsAdmin(Boolean(result.ok && result.isAdmin));
        setLoading(false);
      }

      void load();
      return;
    }

    setIsAdmin(isPlatformAdminEmail(loadSessionPreview().email));
    setLoading(false);
  }, [authEnabled, hydrated, isPlatformAdmin]);

  return { isAdmin, loading };
}
