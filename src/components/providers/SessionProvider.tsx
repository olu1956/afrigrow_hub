"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultSession,
  loadSessionPreview,
  saveSessionPreview,
  type SessionPreview,
} from "@/lib/session-preview";

type SessionContextValue = {
  session: SessionPreview;
  setSession: (
    data: Pick<SessionPreview, "owner" | "name" | "email"> &
      Partial<Pick<SessionPreview, "plan" | "location" | "businessType">>,
  ) => void;
  hydrated: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<SessionPreview>(defaultSession);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSessionState(loadSessionPreview());
    setHydrated(true);
  }, []);

  const setSession = useCallback(
    (
      data: Pick<SessionPreview, "owner" | "name" | "email"> &
        Partial<Pick<SessionPreview, "plan" | "location" | "businessType">>,
    ) => {
      const next = saveSessionPreview(data);
      setSessionState(next);
    },
    [],
  );

  const value = useMemo(
    () => ({ session, setSession, hydrated }),
    [session, setSession, hydrated],
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
