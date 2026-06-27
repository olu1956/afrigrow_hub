import { useSession } from "@/components/providers/SessionProvider";

/** True when Supabase auth is on and the user has a real session (not the Amara demo). */
export function useAuthenticatedUser() {
  const { session, hydrated, authEnabled } = useSession();

  const isAuthenticated =
    authEnabled &&
    hydrated &&
    Boolean(session.email) &&
    session.owner !== "Amara Okonkwo";

  return { isAuthenticated, session, hydrated, authEnabled };
}
