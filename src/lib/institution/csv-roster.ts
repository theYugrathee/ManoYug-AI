/**
 * CSV roster import — validation + formula-injection defence.
 * Preview only until institution admin confirms transactional import.
 */

import { rosterRowSchema } from "@/lib/validation/student";

export type RosterPreviewRow = {
  line: number;
  raw: Record<string, string>;
  ok: boolean;
  errors: string[];
  normalized?: {
    email?: string;
    phone?: string;
    name?: string;
    university_roll_no?: string;
    graduation_year?: number;
    department?: string;
    programme?: string;
    batch?: string;
    status: "ACTIVE" | "INACTIVE" | "PENDING";
  };
};

export type RosterPreviewResult = {
  total: number;
  accepted: number;
  rejected: number;
  duplicates: number;
  warnings: string[];
  rows: RosterPreviewRow[];
};

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

/** Neutralize spreadsheet formula injection on export/import values */
export function escapeCsvFormula(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export function previewRosterCsv(csvText: string): RosterPreviewResult {
  const text = stripBom(csvText).trim();
  const warnings: string[] = [];
  if (!text) {
    return {
      total: 0,
      accepted: 0,
      rejected: 0,
      duplicates: 0,
      warnings: ["Empty file"],
      rows: [],
    };
  }

  if (text.length > 2_000_000) {
    return {
      total: 0,
      accepted: 0,
      rejected: 0,
      duplicates: 0,
      warnings: ["File too large (max ~2MB for preview)"],
      rows: [],
    };
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = parseLine(lines[0]!).map((h) => h.toLowerCase());
  const hasEmail = header.includes("email");

  if (!hasEmail) {
    warnings.push("Missing required column: CSV must include 'email'. Other student details are optional.");
  }

  const seenEmail = new Set<string>();
  const seenPhone = new Set<string>();
  const seenRoll = new Set<string>();
  let duplicates = 0;
  const rows: RosterPreviewRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]!);
    const raw: Record<string, string> = {};
    header.forEach((h, idx) => {
      const normalizedKey = h === "mobile" || h === "mobile_number" ? "phone" : h;
      raw[normalizedKey] = escapeCsvFormula(cells[idx] ?? "");
    });

    const errors: string[] = [];
    const parsed = rosterRowSchema.safeParse({
      email: raw.email || undefined,
      phone: raw.phone || undefined,
      name: raw.name || raw.full_name || undefined,
      university_roll_no: raw.university_roll_no || raw.roll_number || raw.roll_no || undefined,
      graduation_year: raw.graduation_year || undefined,
      department: raw.department,
      programme: raw.programme,
      batch: raw.batch,
      status: (raw.status as "ACTIVE" | "INACTIVE" | "PENDING") || "ACTIVE",
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${issue.path.join(".")}: ${issue.message}`);
      }
    }

    const emailKey = (raw.email ?? "").toLowerCase().trim();
    const phoneDigits = (raw.phone ?? "").replace(/\D/g, "").slice(-10);
    const rollKey = (raw.university_roll_no ?? raw.roll_number ?? "").toUpperCase().trim();

    if (emailKey && seenEmail.has(emailKey)) {
      duplicates += 1;
      errors.push("Duplicate email in file");
    }
    if (phoneDigits && seenPhone.has(phoneDigits)) {
      duplicates += 1;
      errors.push("Duplicate phone number in file");
    }
    if (rollKey && seenRoll.has(rollKey)) {
      duplicates += 1;
      errors.push("Duplicate roll number in file");
    }
    if (emailKey) seenEmail.add(emailKey);
    if (phoneDigits) seenPhone.add(phoneDigits);
    if (rollKey) seenRoll.add(rollKey);

    const ok = errors.length === 0 && parsed.success;
    rows.push({
      line: i + 1,
      raw,
      ok,
      errors,
      normalized: parsed.success ? (parsed.data as any) : undefined,
    });
  }

  const accepted = rows.filter((r) => r.ok).length;
  return {
    total: rows.length,
    accepted,
    rejected: rows.length - accepted,
    duplicates,
    warnings,
    rows: rows.slice(0, 200),
  };
}
