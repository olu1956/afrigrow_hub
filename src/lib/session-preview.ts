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

/** Old placeholder identity — clear if still present in browser storage. */
const LEGACY_PLACEHOLDER_EMAIL = "hello@amarastextiles.com";

export function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

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

/** @deprecated Use emptySession(). */
export function defaultSession(): SessionPreview {
  return emptySession();
}

function isLegacyPlaceholder(session: Pick<SessionPreview, "email">): boolean {
  return session.email === LEGACY_PLACEHOLDER_EMAIL;
}

export function loadSessionPreview(): SessionPreview {
  if (typeof window === "undefined") return emptySession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SessionPreview>;
      const merged = { ...emptySession(), ...parsed } as SessionPreview;
      if (isLegacyPlaceholder(merged)) {
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
    if (isLegacyPlaceholder(session)) {
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
