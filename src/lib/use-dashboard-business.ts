import type { SessionPreview } from "@/lib/session-preview";
import { emptySession, isDemoSession } from "@/lib/session-preview";
import { useSession } from "@/components/providers/SessionProvider";

/** Shown briefly while the real Supabase session is loading. */
export const loadingSession: SessionPreview = emptySession();

/**
 * Dashboard display session. Never shows the Amara demo user when Supabase auth is on.
 */
export function useDashboardBusiness(): {
  business: SessionPreview;
  loading: boolean;
} {
  const { session, hydrated, authEnabled } = useSession();

  if (authEnabled) {
    if (!hydrated) {
      return { business: loadingSession, loading: true };
    }
    // Guard against any leftover demo identity after auth is enabled.
    if (isDemoSession(session)) {
      return { business: emptySession(), loading: true };
    }
    return { business: session, loading: false };
  }

  return {
    business: hydrated ? session : emptySession(),
    loading: !hydrated,
  };
}
