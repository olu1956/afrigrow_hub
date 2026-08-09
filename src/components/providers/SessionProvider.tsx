"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { isPlatformAdminEmail } from "@/lib/auth/admin-emails";
import { getSessionDataAction } from "@/lib/auth/get-session-data";
import { sessionFromUser } from "@/lib/auth/session";
import { fetchUserProfile } from "@/lib/database/fetch-user-profile";
import { fetchUserBusiness } from "@/lib/database/fetch-user-business";
import { createClient } from "@/lib/supabase/client";
import {
  clearSessionPreview,
  emptySession,
  loadSessionPreview,
  saveSessionPreview,
  type SessionPreview,
} from "@/lib/session-preview";

type SessionContextValue = {
  session: SessionPreview;
  setSession: (
    data: Pick<SessionPreview, "owner" | "name" | "email"> &
      Partial<
        Pick<SessionPreview, "plan" | "location" | "country" | "role" | "businessType">
      >,
  ) => void;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  hydrated: boolean;
  authEnabled: boolean;
  isPlatformAdmin: boolean;
  authEmail: string;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function buildSessionFromAuthUser(user: User): Promise<SessionPreview> {
  try {
    const [profile, business] = await Promise.all([
      fetchUserProfile(user.id),
      fetchUserBusiness(user.id),
    ]);
    return sessionFromUser(user, profile, business);
  } catch {
    return sessionFromUser(user, null, null);
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const authEnabled = isSupabaseAuthEnabled();
  const [session, setSessionState] = useState<SessionPreview>(emptySession);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authEnabled) {
      const preview = loadSessionPreview();
      setSessionState(preview);
      setIsPlatformAdmin(isPlatformAdminEmail(preview.email));
      setAuthEmail(preview.email);
      setHydrated(true);
      return;
    }

    const supabase = createClient();
    let active = true;

    async function applyServerSession() {
      const data = await getSessionDataAction();
      if (!active || !data) return false;

      setSessionState(data.session);
      setIsPlatformAdmin((prev) => data.isPlatformAdmin || prev);
      setAuthEmail(data.authEmail);
      saveSessionPreview(data.session);
      setHydrated(true);
      return true;
    }

    async function applyAuthenticatedUser(user: User) {
      const data = await getSessionDataAction();
      if (!active) return;

      if (data) {
        setSessionState(data.session);
        setIsPlatformAdmin((prev) => data.isPlatformAdmin || prev);
        setAuthEmail(data.authEmail);
        saveSessionPreview(data.session);
        return;
      }

      const next = await buildSessionFromAuthUser(user);
      if (!active) return;
      setSessionState(next);
      setAuthEmail(user.email ?? "");
      saveSessionPreview(next);
    }

    async function resetToSignedOut() {
      clearSessionPreview();
      setSessionState(emptySession());
      setIsPlatformAdmin(false);
      setAuthEmail("");
    }

    async function init() {
      try {
        if (await applyServerSession()) return;

        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();

        if (!active) return;

        if (authSession?.user) {
          await applyAuthenticatedUser(authSession.user);
          setHydrated(true);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (user) {
          await applyAuthenticatedUser(user);
        } else {
          await resetToSignedOut();
        }

        setHydrated(true);
      } catch {
        if (active) {
          setSessionState(emptySession());
          setHydrated(true);
        }
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, authSession: Session | null) => {
      if (!active) return;

      if (authSession?.user) {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Defer Supabase calls — awaiting them here deadlocks signInWithPassword.
          window.setTimeout(() => {
            void applyAuthenticatedUser(authSession.user).then(() => {
              if (active) setHydrated(true);
            });
          }, 0);
        }
        return;
      }

      if (event === "SIGNED_OUT") {
        void resetToSignedOut().then(() => {
          if (active) setHydrated(true);
        });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [authEnabled]);

  const setSession = useCallback(
    (
      data: Pick<SessionPreview, "owner" | "name" | "email"> &
        Partial<
          Pick<SessionPreview, "plan" | "location" | "country" | "role" | "businessType">
        >,
    ) => {
      const next = saveSessionPreview(data);
      setSessionState(next);
      setAuthEmail(data.email);
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    if (!authEnabled) {
      const preview = loadSessionPreview();
      setSessionState(preview);
      setIsPlatformAdmin(isPlatformAdminEmail(preview.email));
      setAuthEmail(preview.email);
      setHydrated(true);
      return;
    }

    const data = await getSessionDataAction();
    if (data) {
      setSessionState(data.session);
      setIsPlatformAdmin((prev) => data.isPlatformAdmin || prev);
      setAuthEmail(data.authEmail);
      saveSessionPreview(data.session);
      setHydrated(true);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const next = await buildSessionFromAuthUser(user);
      setSessionState(next);
      setAuthEmail(user.email ?? "");
      saveSessionPreview(next);
    } else {
      clearSessionPreview();
      setSessionState(emptySession());
      setIsPlatformAdmin(false);
      setAuthEmail("");
    }
    setHydrated(true);
  }, [authEnabled]);

  const signOut = useCallback(async () => {
    if (authEnabled) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    clearSessionPreview();
    setSessionState(emptySession());
    setIsPlatformAdmin(false);
    setAuthEmail("");
  }, [authEnabled]);

  const value = useMemo(
    () => ({
      session,
      setSession,
      refreshSession,
      signOut,
      hydrated,
      authEnabled,
      isPlatformAdmin,
      authEmail,
    }),
    [
      session,
      setSession,
      refreshSession,
      signOut,
      hydrated,
      authEnabled,
      isPlatformAdmin,
      authEmail,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
