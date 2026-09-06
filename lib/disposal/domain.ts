export const MAX_ITEM_CHARACTERS = 200;

export const OFFICIAL_FALLBACK = Object.freeze({
  title: "View City and County of Honolulu resident disposal guidance",
  url: "https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/",
});

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CATEGORY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DISALLOWED_CONTROL_PATTERN = /[\p{Cc}\p{Cf}]/u;
const MEANINGFUL_CHARACTER_PATTERN = /[\p{L}\p{N}]/u;
const UNICODE_DASH_PATTERN = /[\u2010-\u2015\u2212]/gu;

export type LookupRow = {
  category_id: string;
  category_name: string;
  alias: string;
  normalized_alias: string;
  locale: string;
  guidance_id: string;
  action_summary: string;
  requirements: string[];
  where_summary: string | null;
  escalation_url: string | null;
  source_id: string;
  source_organization: string;
  source_title: string;
  source_url: string;
  source_verified_on: string;
  source_review_by: string;
  evidence_id: string;
  evidence_summary: string;
  evidence_locator: string | null;
  evidence_claim_scope: string;
  evidence_reviewed_on: string;
};

export type LookupRows = (
  normalizedAlias: string,
  signal?: AbortSignal,
) => Promise<unknown>;

export type InputValidation =
  | { ok: true; normalizedItem: string }
  | { ok: false; message: string };

export type LookupOutcome =
  | {
      status: "success";
      category: { id: string; name: string };
      guidance: {
        action: string;
        requirements: string[];
        where: string | null;
      };
      source: {
        organization: string;
        title: string;
        url: string;
        verifiedOn: string;
      };
      trustMessage: string;
    }
  | {
      status: "ambiguous";
      question: string;
      candidates: Array<{ id: string; name: string }>;
      allowUnsure: true;
      fallback: typeof OFFICIAL_FALLBACK;
    }
  | {
      status: "unsupported";
      reasonCode: "UNSUPPORTED" | "EVIDENCE_UNAVAILABLE";
      message: string;
      fallback: typeof OFFICIAL_FALLBACK;
    }
  | {
      status: "error";
      reasonCode: "DATABASE_UNAVAILABLE";
      retryable: true;
      message: string;
    };

export function normalizeItemInput(value: unknown): InputValidation {
  if (typeof value !== "string") {
    return invalidInput();
  }

  const normalizedItem = value
    .normalize("NFKC")
    .replace(UNICODE_DASH_PATTERN, "-")
    .replace(/\s+/gu, " ")
    .trim()
    .toLocaleLowerCase("en-US");

  if (
    normalizedItem.length === 0 ||
    Array.from(normalizedItem).length > MAX_ITEM_CHARACTERS ||
    DISALLOWED_CONTROL_PATTERN.test(normalizedItem) ||
    !MEANINGFUL_CHARACTER_PATTERN.test(normalizedItem)
  ) {
    return invalidInput();
  }

  return { ok: true, normalizedItem };
}

export async function resolveDisposalLookup(
  rawItem: unknown,
  lookupRows: LookupRows,
  options: {
    signal?: AbortSignal;
    today?: string;
    selectedCategoryId?: string;
  } = {},
): Promise<Extract<InputValidation, { ok: false }> | LookupOutcome> {
  const validation = normalizeItemInput(rawItem);
  if (!validation.ok) return validation;

  let untrustedRows: unknown;
  try {
    untrustedRows = await lookupRows(validation.normalizedItem, options.signal);
  } catch {
    return {
      status: "error",
      reasonCode: "DATABASE_UNAVAILABLE",
      retryable: true,
      message: "Disposal guidance is temporarily unavailable. Please try again.",
    };
  }

  if (!Array.isArray(untrustedRows)) {
    return evidenceUnavailable();
  }

  if (untrustedRows.length === 0) {
    return unsupported();
  }

  const today = options.today ?? new Date().toISOString().slice(0, 10);
  let rows: LookupRow[];
  try {
    rows = untrustedRows.map((row) => parseLookupRow(row, validation.normalizedItem, today));
  } catch {
    return evidenceUnavailable();
  }

  let categories: Array<{ id: string; name: string }>;
  try {
    categories = uniqueCategories(rows);
  } catch {
    return evidenceUnavailable();
  }

  if (options.selectedCategoryId !== undefined) {
    if (categories.length < 2 || categories.length > 4) return unsupported();

    const isAllowedSelection = categories.some(
      (category) => category.id === options.selectedCategoryId,
    );
    if (!isAllowedSelection) return unsupported();

    rows = rows.filter((row) => row.category_id === options.selectedCategoryId);
    categories = categories.filter((category) => category.id === options.selectedCategoryId);
  }

  if (categories.length > 1) {
    if (categories.length > 4) return unsupported();

    return {
      status: "ambiguous",
      question: "Which type best matches your item?",
      candidates: categories,
      allowUnsure: true,
      fallback: OFFICIAL_FALLBACK,
    };
  }

  const first = rows[0];
  if (!first || !rows.every((row) => hasConsistentAnswer(first, row))) {
    return evidenceUnavailable();
  }

  return {
    status: "success",
    category: { id: first.category_id, name: first.category_name },
    guidance: {
      action: first.action_summary,
      requirements: [...first.requirements],
      where: first.where_summary,
    },
    source: {
      organization: first.source_organization,
      title: first.source_title,
      url: first.source_url,
      verifiedOn: first.source_verified_on,
    },
    trustMessage: "Disposal rules come from official sources.",
  };
}

function parseLookupRow(value: unknown, expectedAlias: string, today: string): LookupRow {
  if (!isRecord(value)) throw new Error("Invalid lookup row");

  const row: LookupRow = {
    category_id: requiredString(value.category_id),
    category_name: requiredString(value.category_name),
    alias: requiredString(value.alias),
    normalized_alias: requiredString(value.normalized_alias),
    locale: requiredString(value.locale),
    guidance_id: requiredString(value.guidance_id),
    action_summary: requiredString(value.action_summary),
    requirements: requiredStringArray(value.requirements),
    where_summary: nullableString(value.where_summary),
    escalation_url: nullableOfficialUrl(value.escalation_url),
    source_id: requiredString(value.source_id),
    source_organization: requiredString(value.source_organization),
    source_title: requiredString(value.source_title),
    source_url: requiredOfficialUrl(value.source_url),
    source_verified_on: requiredDate(value.source_verified_on),
    source_review_by: requiredDate(value.source_review_by),
    evidence_id: requiredString(value.evidence_id),
    evidence_summary: requiredString(value.evidence_summary),
    evidence_locator: nullableString(value.evidence_locator),
    evidence_claim_scope: requiredString(value.evidence_claim_scope),
    evidence_reviewed_on: requiredDate(value.evidence_reviewed_on),
  };

  if (
    !CATEGORY_ID_PATTERN.test(row.category_id) ||
    row.normalized_alias !== expectedAlias ||
    row.locale !== "en" ||
    row.source_review_by < today
  ) {
    throw new Error("Lookup row is outside the allowed production contract");
  }

  return row;
}

function uniqueCategories(rows: LookupRow[]): Array<{ id: string; name: string }> {
  const categories = new Map<string, string>();
  for (const row of rows) {
    const existing = categories.get(row.category_id);
    if (existing !== undefined && existing !== row.category_name) {
      throw new Error("Category metadata is inconsistent");
    }
    categories.set(row.category_id, row.category_name);
  }

  return [...categories]
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name, "en-US"));
}

function hasConsistentAnswer(first: LookupRow, row: LookupRow): boolean {
  return (
    row.category_id === first.category_id &&
    row.category_name === first.category_name &&
    row.guidance_id === first.guidance_id &&
    row.action_summary === first.action_summary &&
    JSON.stringify(row.requirements) === JSON.stringify(first.requirements) &&
    row.where_summary === first.where_summary &&
    row.source_id === first.source_id &&
    row.source_organization === first.source_organization &&
    row.source_title === first.source_title &&
    row.source_url === first.source_url &&
    row.source_verified_on === first.source_verified_on
  );
}

function invalidInput(): InputValidation {
  return {
    ok: false,
    message: "Enter one household item using 1 to 200 meaningful characters.",
  };
}

function unsupported(): LookupOutcome {
  return {
    status: "unsupported",
    reasonCode: "UNSUPPORTED",
    message: "This item is not reliably covered yet.",
    fallback: OFFICIAL_FALLBACK,
  };
}

function evidenceUnavailable(): LookupOutcome {
  return {
    status: "unsupported",
    reasonCode: "EVIDENCE_UNAVAILABLE",
    message: "Reviewed official evidence is not currently available for this item.",
    fallback: OFFICIAL_FALLBACK,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown): string {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new Error("Expected a non-empty string");
  }
  return value;
}

function nullableString(value: unknown): string | null {
  if (value === null) return null;
  return requiredString(value);
}

function requiredStringArray(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Expected a non-empty string array");
  }
  return value.map(requiredString);
}

function requiredDate(value: unknown): string {
  const date = requiredString(value);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (
    !DATE_PATTERN.test(date) ||
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error("Expected an ISO date");
  }
  return date;
}

function requiredOfficialUrl(value: unknown): string {
  const url = requiredString(value);
  if (!isApprovedOfficialUrl(url)) throw new Error("Expected an approved official URL");
  return url;
}

function nullableOfficialUrl(value: unknown): string | null {
  if (value === null) return null;
  return requiredOfficialUrl(value);
}

function isApprovedOfficialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLocaleLowerCase("en-US");
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      ["honolulu.gov", "hawaii.gov"].some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
      )
    );
  } catch {
    return false;
  }
}
