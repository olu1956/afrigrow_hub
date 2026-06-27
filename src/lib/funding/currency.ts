export type BusinessCurrency = {
  code: string;
  symbol: string;
  locale: string;
  highFundingThreshold: number;
  exampleAmount: number;
  defaultPotentialLabel: string;
};

const COUNTRY_KEY_ALIASES: Record<string, string> = {
  GB: "uk",
  UK: "uk",
  "United Kingdom": "uk",
  "Great Britain": "uk",
  Canada: "canada",
  France: "france",
  Germany: "germany",
  Netherlands: "netherlands",
  Belgium: "belgium",
  Ireland: "ireland",
  Portugal: "portugal",
  Spain: "spain",
  Italy: "italy",
  Switzerland: "switzerland",
  UAE: "uae",
  "United Arab Emirates": "uae",
  "Saudi Arabia": "saudi arabia",
  Qatar: "qatar",
  Australia: "australia",
  "New Zealand": "new zealand",
  India: "india",
  China: "china",
  Brazil: "brazil",
  US: "usa",
  USA: "usa",
  "United States": "usa",
  "South Africa": "south africa",
  "Côte d'Ivoire": "cote d'ivoire",
  "Cote d'Ivoire": "cote d'ivoire",
};

const CURRENCY_BY_COUNTRY: Record<string, BusinessCurrency> = {
  nigeria: {
    code: "NGN",
    symbol: "₦",
    locale: "en-NG",
    highFundingThreshold: 5_000_000,
    exampleAmount: 2_500_000,
    defaultPotentialLabel: "₦15M+",
  },
  ghana: {
    code: "GHS",
    symbol: "GH₵",
    locale: "en-GH",
    highFundingThreshold: 500_000,
    exampleAmount: 250_000,
    defaultPotentialLabel: "GH₵1.5M+",
  },
  kenya: {
    code: "KES",
    symbol: "KSh",
    locale: "en-KE",
    highFundingThreshold: 2_000_000,
    exampleAmount: 1_000_000,
    defaultPotentialLabel: "KSh6M+",
  },
  "south africa": {
    code: "ZAR",
    symbol: "R",
    locale: "en-ZA",
    highFundingThreshold: 1_000_000,
    exampleAmount: 500_000,
    defaultPotentialLabel: "R3M+",
  },
  uk: {
    code: "GBP",
    symbol: "£",
    locale: "en-GB",
    highFundingThreshold: 50_000,
    exampleAmount: 25_000,
    defaultPotentialLabel: "£150K+",
  },
  usa: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    highFundingThreshold: 50_000,
    exampleAmount: 25_000,
    defaultPotentialLabel: "$150K+",
  },
  canada: {
    code: "CAD",
    symbol: "CA$",
    locale: "en-CA",
    highFundingThreshold: 75_000,
    exampleAmount: 35_000,
    defaultPotentialLabel: "CA$225K+",
  },
  france: {
    code: "EUR",
    symbol: "€",
    locale: "fr-FR",
    highFundingThreshold: 50_000,
    exampleAmount: 25_000,
    defaultPotentialLabel: "€150K+",
  },
  germany: {
    code: "EUR",
    symbol: "€",
    locale: "de-DE",
    highFundingThreshold: 50_000,
    exampleAmount: 25_000,
    defaultPotentialLabel: "€150K+",
  },
  netherlands: {
    code: "EUR",
    symbol: "€",
    locale: "nl-NL",
    highFundingThreshold: 50_000,
    exampleAmount: 25_000,
    defaultPotentialLabel: "€150K+",
  },
  belgium: {
    code: "EUR",
    symbol: "€",
    locale: "fr-BE",
    highFundingThreshold: 50_000,
    exampleAmount: 25_000,
    defaultPotentialLabel: "€150K+",
  },
  ireland: {
    code: "EUR",
    symbol: "€",
    locale: "en-IE",
    highFundingThreshold: 50_000,
    exampleAmount: 25_000,
    defaultPotentialLabel: "€150K+",
  },
  uae: {
    code: "AED",
    symbol: "AED",
    locale: "en-AE",
    highFundingThreshold: 200_000,
    exampleAmount: 100_000,
    defaultPotentialLabel: "AED600K+",
  },
  australia: {
    code: "AUD",
    symbol: "A$",
    locale: "en-AU",
    highFundingThreshold: 75_000,
    exampleAmount: 35_000,
    defaultPotentialLabel: "A$225K+",
  },
  india: {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
    highFundingThreshold: 2_000_000,
    exampleAmount: 1_000_000,
    defaultPotentialLabel: "₹6M+",
  },
  egypt: {
    code: "EGP",
    symbol: "E£",
    locale: "en-EG",
    highFundingThreshold: 500_000,
    exampleAmount: 250_000,
    defaultPotentialLabel: "E£1.5M+",
  },
  morocco: {
    code: "MAD",
    symbol: "MAD",
    locale: "fr-MA",
    highFundingThreshold: 500_000,
    exampleAmount: 250_000,
    defaultPotentialLabel: "MAD1.5M+",
  },
  tunisia: {
    code: "TND",
    symbol: "TND",
    locale: "fr-TN",
    highFundingThreshold: 100_000,
    exampleAmount: 50_000,
    defaultPotentialLabel: "TND300K+",
  },
  rwanda: {
    code: "RWF",
    symbol: "FRw",
    locale: "en-RW",
    highFundingThreshold: 50_000_000,
    exampleAmount: 25_000_000,
    defaultPotentialLabel: "FRw150M+",
  },
  uganda: {
    code: "UGX",
    symbol: "USh",
    locale: "en-UG",
    highFundingThreshold: 200_000_000,
    exampleAmount: 100_000_000,
    defaultPotentialLabel: "USh600M+",
  },
  tanzania: {
    code: "TZS",
    symbol: "TSh",
    locale: "en-TZ",
    highFundingThreshold: 200_000_000,
    exampleAmount: 100_000_000,
    defaultPotentialLabel: "TSh600M+",
  },
  zambia: {
    code: "ZMW",
    symbol: "ZK",
    locale: "en-ZM",
    highFundingThreshold: 500_000,
    exampleAmount: 250_000,
    defaultPotentialLabel: "ZK1.5M+",
  },
  zimbabwe: {
    code: "USD",
    symbol: "$",
    locale: "en-ZW",
    highFundingThreshold: 25_000,
    exampleAmount: 10_000,
    defaultPotentialLabel: "$75K+",
  },
};

const DEFAULT_CURRENCY: BusinessCurrency = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
  highFundingThreshold: 25_000,
  exampleAmount: 10_000,
  defaultPotentialLabel: "$75K+",
};

export function normalizeCountryKey(country: string): string {
  const trimmed = country.trim();
  if (!trimmed) return "";

  const alias = COUNTRY_KEY_ALIASES[trimmed] ?? COUNTRY_KEY_ALIASES[trimmed.toLowerCase()];
  return (alias ?? trimmed).toLowerCase();
}

export function resolveBusinessCurrency(country: string): BusinessCurrency {
  const key = normalizeCountryKey(country);
  if (!key) return DEFAULT_CURRENCY;

  return CURRENCY_BY_COUNTRY[key] ?? DEFAULT_CURRENCY;
}

export function formatFundingAmount(amount: number, country: string): string {
  if (amount <= 0) return "Set funding target";

  const { code, locale } = resolveBusinessCurrency(country);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function defaultFundingPotentialLabel(country: string): string {
  return resolveBusinessCurrency(country).defaultPotentialLabel;
}

export function fundingCurrencyHint(country: string): string {
  const key = normalizeCountryKey(country);
  const currency = resolveBusinessCurrency(country);

  if (!key) {
    return `Enter amounts in ${currency.code}. Set your country in Profile or Settings for local currency.`;
  }

  const label = country.trim() || "your region";
  return `Amounts shown in ${currency.code} (${currency.symbol}) for ${label}.`;
}
