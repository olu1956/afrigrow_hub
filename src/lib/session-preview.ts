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

export function defaultSession(): SessionPreview {
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

export function loadSessionPreview(): SessionPreview {
  if (typeof window === "undefined") return defaultSession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSession(), ...JSON.parse(raw) } as SessionPreview;
  } catch {
    // ignore corrupt storage
  }
  return defaultSession();
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearSessionPreview(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
