export type ZoomAttendee = {
  email: string;
  name: string;
};

export type ZoomAttendanceParseResult = {
  attendees: ZoomAttendee[];
  errors: string[];
};

export type EnrollmentAttendanceMatchInput = {
  id: string;
  traineeEmail: string;
  traineeName: string;
  attended: boolean;
};

export type ZoomAttendanceMatchResult = {
  toMarkIds: string[];
  alreadyAttendedIds: string[];
  unmatchedAttendees: ZoomAttendee[];
  enrolledNotInZoom: number;
};

const EMAIL_HEADERS = new Set([
  "useremail",
  "email",
  "attendeeemail",
  "emailaddress",
  "registrantemail",
  "participantemail",
  "user_email",
]);

const NAME_HEADERS = new Set([
  "name",
  "nameoriginalname",
  "originalname",
  "displayname",
  "attendeename",
  "username",
  "participantname",
]);

const FIRST_NAME_HEADERS = new Set(["firstname", "first"]);
const LAST_NAME_HEADERS = new Set(["lastname", "last"]);

function parseCsvLine(line: string, delimiter: string): string[] {
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
    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function detectDelimiter(line: string): string {
  let commas = 0;
  let semicolons = 0;
  let tabs = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (char === ",") commas += 1;
    if (char === ";") semicolons += 1;
    if (char === "\t") tabs += 1;
  }

  if (tabs > commas && tabs > semicolons) return "\t";
  if (semicolons > commas) return ";";
  return ",";
}

export function normalizeTrainingEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeTrainingName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function headerIndex(headers: string[], names: Set<string>): number {
  return headers.findIndex((header) => names.has(header));
}

function scoreHeaderRow(headers: string[]): number {
  let score = 0;
  if (headerIndex(headers, EMAIL_HEADERS) >= 0) score += 4;
  if (headerIndex(headers, NAME_HEADERS) >= 0) score += 2;
  if (headerIndex(headers, FIRST_NAME_HEADERS) >= 0) score += 1;
  if (headerIndex(headers, LAST_NAME_HEADERS) >= 0) score += 1;
  return score;
}

function attendeeKey(attendee: ZoomAttendee): string {
  if (attendee.email) return `email:${attendee.email}`;
  const nameKey = normalizeTrainingName(attendee.name);
  if (nameKey) return `name:${nameKey}`;
  return "";
}

export function parseZoomAttendanceCsv(csvText: string): ZoomAttendanceParseResult {
  const text = csvText.replace(/^\uFEFF/, "").trim();
  if (!text) {
    return { attendees: [], errors: ["The Zoom file is empty."] };
  }

  const rawLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rawLines.length < 2) {
    return {
      attendees: [],
      errors: ["Zoom CSV needs a header row and at least one participant."],
    };
  }

  const delimiter = detectDelimiter(rawLines[0] ?? "");
  const rows = rawLines.map((line) => parseCsvLine(line, delimiter));

  let headerRowIndex = -1;
  let bestScore = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const headers = (rows[i] ?? []).map(normalizeHeader);
    const score = scoreHeaderRow(headers);
    if (score > bestScore) {
      bestScore = score;
      headerRowIndex = i;
    }
  }

  if (headerRowIndex < 0 || bestScore < 2) {
    return {
      attendees: [],
      errors: [
        "Could not find a Name or Email column. Export the Zoom attendance or registration CSV, then try again.",
      ],
    };
  }

  const headers = (rows[headerRowIndex] ?? []).map(normalizeHeader);
  const emailIdx = headerIndex(headers, EMAIL_HEADERS);
  const nameIdx = headerIndex(headers, NAME_HEADERS);
  const firstIdx = headerIndex(headers, FIRST_NAME_HEADERS);
  const lastIdx = headerIndex(headers, LAST_NAME_HEADERS);

  const unique = new Map<string, ZoomAttendee>();

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const cells = rows[i] ?? [];
    const emailRaw = emailIdx >= 0 ? (cells[emailIdx] ?? "") : "";
    const parsedEmail = normalizeTrainingEmail(emailRaw);
    const email = parsedEmail && looksLikeEmail(parsedEmail) ? parsedEmail : "";

    const nameFromColumn = nameIdx >= 0 ? (cells[nameIdx] ?? "").trim() : "";
    const first = firstIdx >= 0 ? (cells[firstIdx] ?? "").trim() : "";
    const last = lastIdx >= 0 ? (cells[lastIdx] ?? "").trim() : "";
    const name = (nameFromColumn || `${first} ${last}`.trim()).replace(/\s+/g, " ").trim();

    if (!email && !normalizeTrainingName(name)) continue;

    const attendee: ZoomAttendee = { email, name };
    const key = attendeeKey(attendee);
    if (!key || unique.has(key)) continue;
    unique.set(key, attendee);
  }

  const attendees = [...unique.values()];
  if (attendees.length === 0) {
    return {
      attendees: [],
      errors: ["No participant names or emails were found in that Zoom file."],
    };
  }

  return { attendees, errors: [] };
}

export function matchZoomAttendeesToEnrollments(
  attendees: ZoomAttendee[],
  enrollments: EnrollmentAttendanceMatchInput[],
): ZoomAttendanceMatchResult {
  const matchedIds = new Set<string>();
  const unmatchedAttendees: ZoomAttendee[] = [];

  const byEmail = new Map<string, EnrollmentAttendanceMatchInput[]>();
  const byName = new Map<string, EnrollmentAttendanceMatchInput[]>();

  for (const enrollment of enrollments) {
    const email = normalizeTrainingEmail(enrollment.traineeEmail);
    if (email) {
      const list = byEmail.get(email) ?? [];
      list.push(enrollment);
      byEmail.set(email, list);
    }
    const name = normalizeTrainingName(enrollment.traineeName);
    if (name) {
      const list = byName.get(name) ?? [];
      list.push(enrollment);
      byName.set(name, list);
    }
  }

  for (const attendee of attendees) {
    let matches: EnrollmentAttendanceMatchInput[] = [];
    if (attendee.email) {
      matches = (byEmail.get(attendee.email) ?? []).filter((row) => !matchedIds.has(row.id));
    }
    if (matches.length === 0 && attendee.name) {
      const nameMatches = (byName.get(normalizeTrainingName(attendee.name)) ?? []).filter(
        (row) => !matchedIds.has(row.id),
      );
      if (nameMatches.length === 1) {
        matches = nameMatches;
      }
    }

    if (matches.length === 0) {
      unmatchedAttendees.push(attendee);
      continue;
    }

    for (const match of matches) {
      matchedIds.add(match.id);
    }
  }

  const toMarkIds: string[] = [];
  const alreadyAttendedIds: string[] = [];
  for (const enrollment of enrollments) {
    if (!matchedIds.has(enrollment.id)) continue;
    if (enrollment.attended) {
      alreadyAttendedIds.push(enrollment.id);
    } else {
      toMarkIds.push(enrollment.id);
    }
  }

  return {
    toMarkIds,
    alreadyAttendedIds,
    unmatchedAttendees,
    enrolledNotInZoom: enrollments.filter((row) => !matchedIds.has(row.id)).length,
  };
}
