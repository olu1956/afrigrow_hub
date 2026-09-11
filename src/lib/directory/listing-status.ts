import { DIRECTORY_MIN_PROFILE_SCORE } from "@/lib/directory/constants";

export function isBusinessListed(input: {
  businessName?: string | null;
  profileScore?: number | null;
  directoryHidden?: boolean | null;
  directoryOptOut?: boolean | null;
}): boolean {
  const name = input.businessName?.trim() || "";
  const score = typeof input.profileScore === "number" ? input.profileScore : 0;
  return (
    Boolean(name) &&
    score >= DIRECTORY_MIN_PROFILE_SCORE &&
    !input.directoryHidden &&
    !input.directoryOptOut
  );
}
