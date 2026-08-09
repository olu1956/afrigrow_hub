import type { SessionPreview } from "@/lib/session-preview";
import { emptySession } from "@/lib/session-preview";
import { useSession } from "@/components/providers/SessionProvider";

/** Shown briefly while the real Supabase session is loading. */
export const loadingSession: SessionPreview = emptySession();

/** Dashboard display session for the signed-in (or preview) business. */
export function useDashboardBusiness(): {
  business: SessionPreview;
  loading: boolean;
} {
  const { session, hydrated, authEnabled } = useSession();

  if (authEnabled) {
    if (!hydrated) {
      return { business: loadingSession, loading: true };
    }
    return { business: session, loading: false };
  }

  return {
    business: hydrated ? session : emptySession(),
    loading: !hydrated,
  };
}
