import { useSession } from "@/components/providers/SessionProvider";

/** True when Supabase auth is on and the user has a real session. */
export function useAuthenticatedUser() {
  const { session, hydrated, authEnabled, authEmail } = useSession();

  const isAuthenticated =
    authEnabled && hydrated && Boolean(authEmail || session.email);

  return { isAuthenticated, session, hydrated, authEnabled };
}
