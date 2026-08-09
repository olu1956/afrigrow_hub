export type SessionPreview = {
  owner: string;
  name: string;
  email: string;
  plan: string;
  location: string;
  country: string;
  role: string;
  initials: string;
  businessType?: string;
};

const STORAGE_KEY = "afrigrow_session_preview";

export function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

/** Neutral blank session — never an identity for a signed-in user. */
export function emptySession(): SessionPreview {
  return {
    owner: "",
    name: "",
    email: "",
    plan: "Growth",
    location: "",
    country: "",
    role: "owner",
    initials: "",
  };
}

/**
 * Marketing / offline-preview demo only. Must never be shown as a real
 * authenticated account on the dashboard.
 */
export function demoSession(): SessionPreview {
  return {
    owner: "Amara Okonkwo",
    name: "Amara's Textiles",
    email: "hello@amarastextiles.com",
    plan: "Growth",
    location: "Lagos, Nigeria",
    country: "Nigeria",
    role: "owner",
    initials: "AO",
  };
}

/** @deprecated Prefer emptySession() or demoSession() explicitly. */
export function defaultSession(): SessionPreview {
  return emptySession();
}

export function isDemoSession(session: SessionPreview): boolean {
  return (
    session.email === "hello@amarastextiles.com" ||
    (session.owner === "Amara Okonkwo" && session.name === "Amara's Textiles")
  );
}

export function loadSessionPreview(): SessionPreview {
  if (typeof window === "undefined") return emptySession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SessionPreview>;
      const merged = { ...emptySession(), ...parsed } as SessionPreview;
      // Strip legacy Amara defaults that were persisted before the fix.
      if (isDemoSession(merged)) {
        clearSessionPreview();
        return emptySession();
      }
      return merged;
    }
  } catch {
    // ignore corrupt storage
  }
  return emptySession();
}

export function saveSessionPreview(
  data: Pick<SessionPreview, "owner" | "name" | "email"> &
    Partial<
      Pick<SessionPreview, "plan" | "location" | "country" | "role" | "businessType">
    >,
): SessionPreview {
  const session: SessionPreview = {
    plan: "Growth",
    location: "",
    country: "",
    role: "owner",
    businessType: undefined,
    ...data,
    initials: initialsFromName(data.owner),
  };
  if (typeof window !== "undefined") {
    if (isDemoSession(session)) {
      clearSessionPreview();
      return emptySession();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearSessionPreview(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
