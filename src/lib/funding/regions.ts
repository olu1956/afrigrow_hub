import { normalizeCountryKey } from "@/lib/funding/currency";

/** Normalized keys for West African countries. */
export const WEST_AFRICA_COUNTRY_KEYS = new Set([
  "nigeria",
  "ghana",
  "senegal",
  "cote d'ivoire",
  "sierra leone",
  "liberia",
  "guinea",
  "benin",
  "togo",
  "burkina faso",
  "mali",
  "niger",
  "gambia",
  "cape verde",
]);

/** Normalized keys for African countries supported on the platform. */
export const AFRICA_COUNTRY_KEYS = new Set([
  ...WEST_AFRICA_COUNTRY_KEYS,
  "kenya",
  "uganda",
  "tanzania",
  "rwanda",
  "ethiopia",
  "south africa",
  "zambia",
  "zimbabwe",
  "egypt",
  "morocco",
  "tunisia",
  "cameroon",
  "angola",
  "mozambique",
  "botswana",
  "namibia",
  "mauritius",
]);

export function isAfricanCountry(countryKey: string): boolean {
  return AFRICA_COUNTRY_KEYS.has(countryKey);
}

export function isWestAfricanCountry(countryKey: string): boolean {
  return WEST_AFRICA_COUNTRY_KEYS.has(countryKey);
}

export function opportunityMatchesCountry(
  countryKeys: string[],
  userCountry: string,
): boolean {
  const userKey = normalizeCountryKey(userCountry);
  if (!userKey) return true;

  if (countryKeys.includes(userKey)) return true;
  if (countryKeys.includes("africa") && isAfricanCountry(userKey)) return true;
  if (countryKeys.includes("west-africa") && isWestAfricanCountry(userKey)) return true;

  return false;
}

export function regionMatchScore(countryKeys: string[], userCountry: string): number {
  const userKey = normalizeCountryKey(userCountry);
  if (!userKey) return 18;

  if (countryKeys.includes(userKey)) return 35;
  if (countryKeys.includes("west-africa") && isWestAfricanCountry(userKey)) return 28;
  if (countryKeys.includes("africa") && isAfricanCountry(userKey)) return 22;

  return 0;
}
