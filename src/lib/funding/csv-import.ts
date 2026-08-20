import type { FundingOpportunityInsert } from "@/lib/database/funding-opportunities";
import type { BusinessStage, FundingType } from "@/lib/funding-data";

const FUNDING_TYPES = new Set(["grant", "loan", "accelerator", "equity"]);
const STAGES = new Set(["idea", "pre_revenue", "early", "growth", "established"]);

function splitList(value: string): string[] {
  return value
    .split(/[|;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function slugifyId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export type ParsedFundingCsvRow = FundingOpportunityInsert;

export type FundingCsvParseResult = {
  rows: ParsedFundingCsvRow[];
  errors: string[];
};

/**
 * CSV headers (case-insensitive):
 * id,name,provider,type,amount,region,deadline,eligibility,description,applyUrl,
 * sectors,countryKeys,eligibleStages,sectorKeys,fundingMin,fundingMax,fundingCurrency,status
 *
 * List fields use | or ; separators.
 * countryKeys example: nigeria|west-africa
 */
export function parseFundingOpportunitiesCsv(csvText: string): FundingCsvParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length < 2) {
    return { rows: [], errors: ["CSV needs a header row and at least one data row."] };
  }

  const headers = parseCsvLine(lines[0]!).map((h) => h.toLowerCase().replace(/\s+/g, ""));
  const required = ["name", "countrykeys"];
  for (const key of required) {
    if (!headers.includes(key) && !(key === "countrykeys" && headers.includes("country_keys"))) {
      if (key === "countrykeys" && headers.includes("country_keys")) continue;
      if (key === "countrykeys") {
        return {
          rows: [],
          errors: ["CSV must include a countryKeys (or country_keys) column."],
        };
      }
      return { rows: [], errors: [`CSV must include a ${key} column.`] };
    }
  }

  const indexOf = (names: string[]) => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const rows: ParsedFundingCsvRow[] = [];
  const errors: string[] = [];

  for (let lineNo = 1; lineNo < lines.length; lineNo += 1) {
    const cells = parseCsvLine(lines[lineNo]!);
    const get = (names: string[]) => {
      const idx = indexOf(names);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    };

    const name = get(["name"]);
    if (!name) {
      errors.push(`Row ${lineNo + 1}: name is required.`);
      continue;
    }

    const countryKeys = splitList(get(["countrykeys", "country_keys"])).map((k) =>
      k.toLowerCase(),
    );
    if (countryKeys.length === 0) {
      errors.push(`Row ${lineNo + 1}: countryKeys is required (e.g. nigeria|uk|africa).`);
      continue;
    }

    const typeRaw = get(["type"]).toLowerCase() || "grant";
    if (!FUNDING_TYPES.has(typeRaw)) {
      errors.push(`Row ${lineNo + 1}: type must be grant, loan, accelerator, or equity.`);
      continue;
    }

    const stages = splitList(get(["eligiblestages", "eligible_stages"])).filter((s) =>
      STAGES.has(s),
    ) as BusinessStage[];

    const statusRaw = (get(["status"]) || "published").toLowerCase();
    const status = statusRaw === "draft" ? "draft" : "published";

    const id =
      get(["id"]) ||
      slugifyId(`${get(["provider"]) || "fund"}-${name}`) ||
      `row-${lineNo + 1}`;

    const fundingMinRaw = get(["fundingmin", "funding_min"]);
    const fundingMaxRaw = get(["fundingmax", "funding_max"]);

    rows.push({
      id,
      name,
      provider: get(["provider"]),
      type: typeRaw as FundingType,
      amount: get(["amount"]),
      region: get(["region"]),
      deadline: get(["deadline"]),
      eligibility: get(["eligibility"]),
      description: get(["description"]),
      apply_url: get(["applyurl", "apply_url"]),
      sectors: splitList(get(["sectors"])),
      country_keys: countryKeys,
      eligible_stages: stages.length > 0 ? stages : ["early", "growth"],
      sector_keys: splitList(get(["sectorkeys", "sector_keys"])).map((s) => s.toLowerCase()),
      funding_min: fundingMinRaw ? Number(fundingMinRaw) : null,
      funding_max: fundingMaxRaw ? Number(fundingMaxRaw) : null,
      funding_currency: get(["fundingcurrency", "funding_currency"]).toUpperCase(),
      status,
    });
  }

  return { rows, errors };
}

export const FUNDING_CSV_TEMPLATE = `id,name,provider,type,amount,region,deadline,eligibility,description,applyUrl,sectors,countryKeys,eligibleStages,sectorKeys,fundingMin,fundingMax,fundingCurrency,status
sample-ng-grant,Example Nigeria Grant,Example Bank,grant,₦5M,Nigeria,Dec 2026,Registered SMEs in Nigeria,Short description,https://example.com/apply,Retail|Services,nigeria,early|growth,retail|services,0,5000000,NGN,published
`;
