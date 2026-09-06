import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const inventoryUrl = new URL("../data/source-inventory.json", import.meta.url);
const inventoryPath = fileURLToPath(inventoryUrl);
const requiredCandidateIds = new Set([
  "mattresses",
  "propane-cylinders",
  "televisions-electronics",
  "household-batteries",
  "paint",
]);
const allowedReviewStates = new Set([
  "verified",
  "verified_with_gaps",
  "blocked_incomplete",
  "blocked_conflict",
  "rejected",
]);
const requiredRecordPaths = [
  "record_id",
  "candidate_category_id",
  "candidate_category_name",
  "candidate_status",
  "source.organization",
  "source.title",
  "source.url",
  "source.accessed_on",
  "source.apparent_updated_or_effective_on",
  "source.date_basis",
  "source.authority_level",
  "source.government_domain",
  "source.authority_justification",
  "evidence",
  "supported_action",
  "important_restrictions",
  "destination_or_program",
  "known_gaps",
  "known_conflicts",
  "review_state",
  "verification_notes",
  "duplicate_source_url_justification",
];
const forbiddenPlaceholder = /^(?:unknown|tbd|todo|n\/?a|none|placeholder|lorem ipsum)$/i;
const errors = [];

function addError(message) {
  errors.push(message);
}

function hasOwnPath(value, path) {
  return path.split(".").every((part) => {
    if (value === null || typeof value !== "object" || !Object.hasOwn(value, part)) {
      return false;
    }
    value = value[part];
    return true;
  });
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0 && !forbiddenPlaceholder.test(value.trim());
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function validateHttpsGovernmentUrl(rawUrl, label) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    addError(`${label} is not a valid URL.`);
    return null;
  }

  if (parsed.protocol !== "https:") {
    addError(`${label} must use HTTPS.`);
  }

  const hostname = parsed.hostname.toLowerCase();
  const isGovernmentDomain =
    hostname === "honolulu.gov" ||
    hostname.endsWith(".honolulu.gov") ||
    hostname === "hawaii.gov" ||
    hostname.endsWith(".hawaii.gov");
  if (!isGovernmentDomain) {
    addError(`${label} must use an allowed Honolulu or Hawaii government domain.`);
  }
  return hostname;
}

function validateStringArray(value, label) {
  if (!Array.isArray(value)) {
    addError(`${label} must be an array.`);
    return;
  }
  value.forEach((item, index) => {
    if (!nonEmptyString(item)) {
      addError(`${label}[${index}] must be a non-placeholder string.`);
    }
  });
}

function findPlaceholderStrings(value, path = "inventory") {
  if (typeof value === "string" && forbiddenPlaceholder.test(value.trim())) {
    addError(`${path} uses a forbidden placeholder string; use null for an unknown scalar.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findPlaceholderStrings(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => findPlaceholderStrings(item, `${path}.${key}`));
  }
}

let inventory;
try {
  inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
} catch (error) {
  console.error(`Source inventory validation failed: ${error.message}`);
  process.exit(1);
}

if (inventory.schema_version !== "1.0.0") {
  addError('schema_version must be "1.0.0".');
}
if (inventory.inventory_kind !== "pilot_candidate_source_inventory") {
  addError('inventory_kind must be "pilot_candidate_source_inventory".');
}
if (inventory.date_format !== "YYYY-MM-DD") {
  addError('date_format must document "YYYY-MM-DD".');
}
if (!nonEmptyString(inventory.unknown_representation) || !inventory.unknown_representation.includes("null")) {
  addError("unknown_representation must document null for unknown scalar values.");
}
if (!validDate(inventory.source_access_date)) {
  addError("source_access_date must be a valid YYYY-MM-DD date.");
}
if (
  !Array.isArray(inventory.review_state_allowlist) ||
  inventory.review_state_allowlist.length !== allowedReviewStates.size ||
  inventory.review_state_allowlist.some((state) => !allowedReviewStates.has(state))
) {
  addError("review_state_allowlist must exactly match the validator's explicit allowlist.");
}
if (
  !Array.isArray(inventory.required_candidate_ids) ||
  inventory.required_candidate_ids.length !== requiredCandidateIds.size ||
  inventory.required_candidate_ids.some((id) => !requiredCandidateIds.has(id))
) {
  addError("required_candidate_ids must contain exactly the five BL-001 candidate IDs.");
}
if (!Array.isArray(inventory.records)) {
  addError("records must be an array.");
} else if (inventory.records.length !== 5) {
  addError(`records must contain exactly five entries; found ${inventory.records.length}.`);
}

const records = Array.isArray(inventory.records) ? inventory.records : [];
const recordIds = new Set();
const candidateIds = new Set();
const recordsByUrl = new Map();

records.forEach((record, index) => {
  const label = `records[${index}]`;

  requiredRecordPaths.forEach((path) => {
    if (!hasOwnPath(record, path)) {
      addError(`${label}.${path} is required.`);
    }
  });

  if (!nonEmptyString(record.record_id)) {
    addError(`${label}.record_id must be a non-placeholder string.`);
  } else if (recordIds.has(record.record_id)) {
    addError(`${label}.record_id duplicates ${record.record_id}.`);
  } else {
    recordIds.add(record.record_id);
  }

  if (!requiredCandidateIds.has(record.candidate_category_id)) {
    addError(`${label}.candidate_category_id is not one of the five required candidates.`);
  } else if (candidateIds.has(record.candidate_category_id)) {
    addError(`${label}.candidate_category_id duplicates ${record.candidate_category_id}.`);
  } else {
    candidateIds.add(record.candidate_category_id);
  }

  if (!nonEmptyString(record.candidate_category_name)) {
    addError(`${label}.candidate_category_name must be a non-placeholder string.`);
  }
  if (record.candidate_status !== "candidate_not_frozen") {
    addError(`${label}.candidate_status must be "candidate_not_frozen".`);
  }

  const source = record.source;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    addError(`${label}.source must be an object.`);
  } else {
    ["organization", "title", "date_basis", "authority_level", "government_domain"].forEach((field) => {
      if (!nonEmptyString(source[field])) {
        addError(`${label}.source.${field} must be a non-placeholder string.`);
      }
    });
    if (nonEmptyString(source.url)) {
      const hostname = validateHttpsGovernmentUrl(source.url, `${label}.source.url`);
      const domainRoot = hostname?.endsWith("honolulu.gov")
        ? "honolulu.gov"
        : hostname?.endsWith("hawaii.gov")
          ? "hawaii.gov"
          : null;
      if (source.government_domain !== domainRoot) {
        addError(`${label}.source.government_domain must match the source URL's government domain.`);
      }
      if (source.authority_level === "city_primary" && domainRoot !== "honolulu.gov") {
        addError(`${label}.source.authority_level cannot be city_primary for a non-Honolulu source.`);
      }
      const group = recordsByUrl.get(source.url) ?? [];
      group.push(record);
      recordsByUrl.set(source.url, group);
    } else {
      addError(`${label}.source.url must be a non-placeholder string.`);
    }
    if (!validDate(source.accessed_on)) {
      addError(`${label}.source.accessed_on must be a valid YYYY-MM-DD date.`);
    } else if (source.accessed_on !== inventory.source_access_date) {
      addError(`${label}.source.accessed_on must match the pilot source_access_date.`);
    }
    if (
      source.apparent_updated_or_effective_on !== null &&
      !validDate(source.apparent_updated_or_effective_on)
    ) {
      addError(`${label}.source.apparent_updated_or_effective_on must be null or a valid YYYY-MM-DD date.`);
    }
    if (!["city_primary", "state_primary", "other_primary_government"].includes(source.authority_level)) {
      addError(`${label}.source.authority_level is not allowlisted.`);
    }
    if (source.authority_level !== "city_primary" && !nonEmptyString(source.authority_justification)) {
      addError(`${label}.source.authority_justification is required for a non-default authority.`);
    }
    if (source.authority_level === "city_primary" && source.authority_justification !== null) {
      addError(`${label}.source.authority_justification must be null for the default City authority.`);
    }
  }

  if (!Array.isArray(record.evidence) || record.evidence.length === 0) {
    addError(`${label}.evidence must contain at least one bounded evidence item.`);
  } else {
    record.evidence.forEach((item, evidenceIndex) => {
      const evidenceLabel = `${label}.evidence[${evidenceIndex}]`;
      ["evidence_type", "locator", "summary", "claim_scope"].forEach((field) => {
        if (!nonEmptyString(item?.[field])) {
          addError(`${evidenceLabel}.${field} must be a non-placeholder string.`);
        }
      });
      if (item?.evidence_type !== "structured_summary") {
        addError(`${evidenceLabel}.evidence_type must be "structured_summary".`);
      }
    });
  }

  if (!nonEmptyString(record.supported_action)) {
    addError(`${label}.supported_action must be a non-placeholder string.`);
  }
  validateStringArray(record.important_restrictions, `${label}.important_restrictions`);
  validateStringArray(record.known_gaps, `${label}.known_gaps`);
  validateStringArray(record.known_conflicts, `${label}.known_conflicts`);

  const destination = record.destination_or_program;
  if (destination !== null) {
    if (!destination || typeof destination !== "object" || Array.isArray(destination)) {
      addError(`${label}.destination_or_program must be null or an object.`);
    } else {
      ["name", "type", "details"].forEach((field) => {
        if (!nonEmptyString(destination[field])) {
          addError(`${label}.destination_or_program.${field} must be a non-placeholder string.`);
        }
      });
      if (destination.url !== null) {
        if (!nonEmptyString(destination.url)) {
          addError(`${label}.destination_or_program.url must be null or a non-placeholder string.`);
        } else {
          validateHttpsGovernmentUrl(destination.url, `${label}.destination_or_program.url`);
        }
      }
    }
  }

  if (!allowedReviewStates.has(record.review_state)) {
    addError(`${label}.review_state is not in the explicit allowlist.`);
  }
  if (
    record.review_state === "verified_with_gaps" &&
    Array.isArray(record.known_gaps) &&
    Array.isArray(record.known_conflicts) &&
    record.known_gaps.length === 0 &&
    record.known_conflicts.length === 0
  ) {
    addError(`${label}.review_state is verified_with_gaps but no gap or conflict is recorded.`);
  }
  if (!nonEmptyString(record.verification_notes)) {
    addError(`${label}.verification_notes must be a non-placeholder string.`);
  }
});

for (const candidateId of requiredCandidateIds) {
  if (!candidateIds.has(candidateId)) {
    addError(`Missing required candidate category: ${candidateId}.`);
  }
}

for (const [url, urlRecords] of recordsByUrl) {
  if (urlRecords.length > 1) {
    urlRecords.forEach((record) => {
      if (!nonEmptyString(record.duplicate_source_url_justification)) {
        addError(
          `${record.record_id}.duplicate_source_url_justification is required because ${url} is used by multiple records.`,
        );
      }
    });
  }
}

findPlaceholderStrings(inventory);

if (errors.length > 0) {
  console.error(`Source inventory validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const uniqueUrls = new Set(records.map((record) => record.source.url));
const conflictCount = records.reduce((total, record) => total + record.known_conflicts.length, 0);
console.log("Source inventory validation passed.");
console.log(`Records: ${records.length}`);
console.log(`Candidate groups: ${candidateIds.size}`);
console.log(`Unique authoritative URLs: ${uniqueUrls.size}`);
console.log(`Recorded conflicts: ${conflictCount}`);
