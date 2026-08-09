import { useSession } from "@/components/providers/SessionProvider";
import { isDemoSession } from "@/lib/session-preview";

/** True when Supabase auth is on and the user has a real session (not the Amara demo). */
export function useAuthenticatedUser() {
  const { session, hydrated, authEnabled, authEmail } = useSession();

  const isAuthenticated =
    authEnabled &&
    hydrated &&
    Boolean(authEmail || session.email) &&
    !isDemoSession(session);

  return { isAuthenticated, session, hydrated, authEnabled };
}
