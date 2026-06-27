export type CountryOption = {
  value: string;
  label: string;
};

export const africanCountryOptions: CountryOption[] = [
  { value: "Algeria", label: "Algeria" },
  { value: "Angola", label: "Angola" },
  { value: "Benin", label: "Benin" },
  { value: "Botswana", label: "Botswana" },
  { value: "Burkina Faso", label: "Burkina Faso" },
  { value: "Cameroon", label: "Cameroon" },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
  { value: "Egypt", label: "Egypt" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "Gabon", label: "Gabon" },
  { value: "Gambia", label: "Gambia" },
  { value: "Ghana", label: "Ghana" },
  { value: "Kenya", label: "Kenya" },
  { value: "Liberia", label: "Liberia" },
  { value: "Malawi", label: "Malawi" },
  { value: "Mali", label: "Mali" },
  { value: "Mauritius", label: "Mauritius" },
  { value: "Morocco", label: "Morocco" },
  { value: "Mozambique", label: "Mozambique" },
  { value: "Namibia", label: "Namibia" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Rwanda", label: "Rwanda" },
  { value: "Senegal", label: "Senegal" },
  { value: "Sierra Leone", label: "Sierra Leone" },
  { value: "South Africa", label: "South Africa" },
  { value: "Tanzania", label: "Tanzania" },
  { value: "Togo", label: "Togo" },
  { value: "Tunisia", label: "Tunisia" },
  { value: "Uganda", label: "Uganda" },
  { value: "Zambia", label: "Zambia" },
  { value: "Zimbabwe", label: "Zimbabwe" },
];

/** Diaspora and international markets common for African-owned businesses. */
export const internationalCountryOptions: CountryOption[] = [
  { value: "UK", label: "United Kingdom" },
  { value: "USA", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "France", label: "France" },
  { value: "Germany", label: "Germany" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Belgium", label: "Belgium" },
  { value: "Ireland", label: "Ireland" },
  { value: "Portugal", label: "Portugal" },
  { value: "Spain", label: "Spain" },
  { value: "Italy", label: "Italy" },
  { value: "Switzerland", label: "Switzerland" },
  { value: "UAE", label: "United Arab Emirates" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Qatar", label: "Qatar" },
  { value: "Australia", label: "Australia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "India", label: "India" },
  { value: "China", label: "China" },
  { value: "Brazil", label: "Brazil" },
];

/** Flat list for legacy imports — includes placeholder + all countries. */
export const africanCountries = [
  { value: "", label: "Select country" },
  ...africanCountryOptions,
  ...internationalCountryOptions,
] as const;

export const allBusinessCountryOptions: CountryOption[] = [
  ...africanCountryOptions,
  ...internationalCountryOptions,
];

export function isKnownBusinessCountry(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return allBusinessCountryOptions.some((option) => option.value === trimmed);
}

export function countryOptionLabel(value: string): string {
  const match = allBusinessCountryOptions.find((option) => option.value === value.trim());
  return match?.label ?? value.trim();
}

const COUNTRY_VALUE_ALIASES: Record<string, string> = {
  GB: "UK",
  "United Kingdom": "UK",
  "Great Britain": "UK",
  US: "USA",
  "United States": "USA",
  "United Arab Emirates": "UAE",
};

/** Maps legacy or display names to a value present in the country select. */
export function normalizeCountrySelectValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isKnownBusinessCountry(trimmed)) return trimmed;
  return COUNTRY_VALUE_ALIASES[trimmed] ?? COUNTRY_VALUE_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}
