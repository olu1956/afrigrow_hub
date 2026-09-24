import type { ProviderEnrollmentRosterEntry } from "@/lib/training-data";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function slugFilenamePart(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "session"
  );
}

export function rosterEntriesToCsv(entries: ProviderEnrollmentRosterEntry[]): string {
  const header = [
    "trainee_name",
    "trainee_email",
    "trainee_phone",
    "trainee_business",
    "course_title",
    "session_title",
    "session_starts_at",
    "attended",
    "status",
  ];

  const lines = [header.join(",")];
  for (const entry of entries) {
    lines.push(
      [
        csvEscape(entry.traineeName),
        csvEscape(entry.traineeEmail),
        csvEscape(entry.traineePhone),
        csvEscape(entry.traineeBusiness),
        csvEscape(entry.courseTitle),
        csvEscape(entry.sessionTitle),
        csvEscape(entry.sessionStartsAt),
        entry.attended ? "yes" : "no",
        csvEscape(entry.status),
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function rosterExportFilename(sessionTitle: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `afrigrow-enrolments-${slugFilenamePart(sessionTitle)}-${day}.csv`;
}

export function downloadTextFile(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
