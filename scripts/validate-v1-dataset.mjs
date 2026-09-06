import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const datasetPath = fileURLToPath(new URL("../data/v1-canonical-dataset.json", import.meta.url));
const expectedCategoryIds = new Set([
  "mattresses",
  "household-chairs-and-tables",
  "rugs-and-carpeting",
  "green-waste",
  "large-household-appliances",
  "passenger-and-light-truck-tires",
  "alkaline-and-single-use-batteries",
  "standalone-rechargeable-batteries",
  "car-and-motorcycle-lead-acid-batteries",
  "household-propane-containers",
  "televisions",
  "computers-and-peripherals",
  "non-cfl-light-bulbs",
  "household-medical-sharps",
  "compact-fluorescent-bulbs-and-tubes",
]);
const allowedReviewStates = new Set([
  "pending_human_review",
  "approved",
  "expired",
  "conflict",
  "rejected",
]);
const allowedAuthorityLevels = new Set([
  "city_primary",
  "state_primary",
  "other_primary_government",
]);
const forbiddenPlaceholder = /^(?:unknown|tbd|todo|n\/?a|none|placeholder|lorem ipsum)$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const errors = [];

function addError(message) {
  errors.push(message);
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

function normalizeAlias(value) {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s+/g, " ");
}

function validateStringArray(value, label, { allowEmpty = true } = {}) {
  if (!Array.isArray(value)) {
    addError(`${label} must be an array.`);
    return;
  }
  if (!allowEmpty && value.length === 0) {
    addError(`${label} must not be empty.`);
  }
  value.forEach((entry, index) => {
    if (!nonEmptyString(entry)) {
      addError(`${label}[${index}] must be a non-placeholder string.`);
    }
  });
}

function governmentUrlInfo(rawUrl, label) {
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
  if (hostname === "honolulu.gov" || hostname.endsWith(".honolulu.gov")) {
    return { hostname, domainRoot: "honolulu.gov" };
  }
  if (hostname === "hawaii.gov" || hostname.endsWith(".hawaii.gov")) {
    return { hostname, domainRoot: "hawaii.gov" };
  }
  addError(`${label} must use an allowed Honolulu or Hawaiʻi government domain.`);
  return { hostname, domainRoot: null };
}

function findPlaceholderStrings(value, path = "dataset") {
  if (typeof value === "string" && forbiddenPlaceholder.test(value.trim())) {
    addError(`${path} uses a forbidden placeholder string; use null for an unknown scalar.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findPlaceholderStrings(entry, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => findPlaceholderStrings(entry, `${path}.${key}`));
  }
}

let dataset;
try {
  dataset = JSON.parse(await readFile(datasetPath, "utf8"));
} catch (error) {
  console.error(`V1 dataset validation failed: ${error.message}`);
  process.exit(1);
}

if (dataset.schema_version !== "1.0.0") {
  addError('schema_version must be "1.0.0".');
}
if (!["pending_human_review", "approved"].includes(dataset.status)) {
  addError('status must be "pending_human_review" or "approved".');
}
if (
  (dataset.status === "pending_human_review" && dataset.dataset_kind !== "v1_canonical_dataset_candidate") ||
  (dataset.status === "approved" && dataset.dataset_kind !== "v1_canonical_dataset")
) {
  addError("dataset_kind must identify a candidate while pending and canonical data after approval.");
}
if (!validDate(dataset.research_checked_on)) {
  addError("research_checked_on must use a valid YYYY-MM-DD date.");
}
if (dataset.date_format !== "YYYY-MM-DD") {
  addError('date_format must be "YYYY-MM-DD".');
}
if (!nonEmptyString(dataset.unknown_representation) || !dataset.unknown_representation.includes("null")) {
  addError("unknown_representation must document null for unknown scalar values.");
}
if (
  !Array.isArray(dataset.review_state_allowlist) ||
  dataset.review_state_allowlist.length !== allowedReviewStates.size ||
  new Set(dataset.review_state_allowlist).size !== allowedReviewStates.size ||
  dataset.review_state_allowlist.some((state) => !allowedReviewStates.has(state))
) {
  addError("review_state_allowlist must exactly match the validator allowlist.");
}
if (!dataset.normalization || typeof dataset.normalization !== "object") {
  addError("normalization is required.");
} else {
  if (dataset.normalization.locale !== "en-US") {
    addError('normalization.locale must be "en-US".');
  }
  const algorithm = dataset.normalization.algorithm;
  if (
    !nonEmptyString(algorithm) ||
    !["NFKC", "trim", "lowercase", "dash", "whitespace"].every((term) =>
      algorithm.toLowerCase().includes(term.toLowerCase()),
    )
  ) {
    addError("normalization.algorithm must document every implemented normalization step.");
  }
}
if (!dataset.review_policy || typeof dataset.review_policy !== "object") {
  addError("review_policy is required.");
} else {
  if (dataset.review_policy.human_approval_required !== true) {
    addError("review_policy.human_approval_required must be true.");
  }
  if (dataset.review_policy.default_review_cadence_days !== 90) {
    addError("review_policy.default_review_cadence_days must preserve the documented 90-day assumption.");
  }
  if (dataset.review_policy.dynamic_source_review_cadence_days !== 30) {
    addError("review_policy.dynamic_source_review_cadence_days must document the shorter dynamic-source cadence.");
  }
  if (!nonEmptyString(dataset.review_policy.production_rule)) {
    addError("review_policy.production_rule must be a non-placeholder string.");
  }
}

const categories = Array.isArray(dataset.categories) ? dataset.categories : [];
const sources = Array.isArray(dataset.sources) ? dataset.sources : [];
const evidence = Array.isArray(dataset.evidence) ? dataset.evidence : [];
if (!Array.isArray(dataset.categories)) addError("categories must be an array.");
if (!Array.isArray(dataset.sources)) addError("sources must be an array.");
if (!Array.isArray(dataset.evidence)) addError("evidence must be an array.");
if (categories.length < 15 || categories.length > 25) {
  addError(`categories must contain 15–25 records; found ${categories.length}.`);
}
if (dataset.category_count !== categories.length) {
  addError("category_count must equal categories.length.");
}
if (categories.length !== expectedCategoryIds.size) {
  addError(`This BL-002 candidate must contain exactly ${expectedCategoryIds.size} selected categories.`);
}

const selectedCategoryIds = Array.isArray(dataset.selected_category_ids)
  ? dataset.selected_category_ids
  : [];
if (!Array.isArray(dataset.selected_category_ids)) {
  addError("selected_category_ids must be an array.");
}
if (
  selectedCategoryIds.length !== expectedCategoryIds.size ||
  new Set(selectedCategoryIds).size !== selectedCategoryIds.length ||
  selectedCategoryIds.some((id) => !expectedCategoryIds.has(id))
) {
  addError("selected_category_ids must contain exactly the frozen candidate ID set without duplicates.");
}

const sourceById = new Map();
const sourceUrls = new Set();
sources.forEach((source, index) => {
  const label = `sources[${index}]`;
  if (!nonEmptyString(source.id) || !slugPattern.test(source.id)) {
    addError(`${label}.id must be a stable kebab-case identifier.`);
  } else if (sourceById.has(source.id)) {
    addError(`${label}.id duplicates ${source.id}.`);
  } else {
    sourceById.set(source.id, source);
  }
  ["organization", "title", "date_basis", "verification_notes"].forEach((field) => {
    if (!nonEmptyString(source[field])) addError(`${label}.${field} must be a non-placeholder string.`);
  });
  if (!allowedAuthorityLevels.has(source.authority_level)) {
    addError(`${label}.authority_level is not allowlisted.`);
  }
  if (!nonEmptyString(source.url)) {
    addError(`${label}.url must be a non-placeholder string.`);
  } else {
    const urlInfo = governmentUrlInfo(source.url, `${label}.url`);
    if (urlInfo && source.government_domain !== urlInfo.domainRoot) {
      addError(`${label}.government_domain must match the source URL.`);
    }
    if (source.authority_level === "city_primary" && urlInfo?.domainRoot !== "honolulu.gov") {
      addError(`${label} marked city_primary must use a Honolulu government domain.`);
    }
    if (sourceUrls.has(source.url)) {
      addError(`${label}.url duplicates an existing source URL.`);
    }
    sourceUrls.add(source.url);
  }
  ["first_retrieved_on", "research_checked_on"].forEach((field) => {
    if (!validDate(source[field])) addError(`${label}.${field} must use a valid YYYY-MM-DD date.`);
  });
  if (source.research_checked_on !== dataset.research_checked_on) {
    addError(`${label}.research_checked_on must match the dataset research date.`);
  }
  if (source.apparent_updated_on !== null && !validDate(source.apparent_updated_on)) {
    addError(`${label}.apparent_updated_on must be null or a valid YYYY-MM-DD date.`);
  }
  if (!Number.isInteger(source.review_cadence_days) || source.review_cadence_days < 1) {
    addError(`${label}.review_cadence_days must be a positive integer.`);
  }
  if (!allowedReviewStates.has(source.review_status)) {
    addError(`${label}.review_status is not allowlisted.`);
  }
  if (source.review_status === "pending_human_review") {
    if (source.last_human_verified_on !== null || source.review_by !== null) {
      addError(`${label} cannot claim human verification or a review_by date while pending human review.`);
    }
  } else if (source.review_status === "approved") {
    if (!validDate(source.last_human_verified_on) || !validDate(source.review_by)) {
      addError(`${label} must have human verification and review_by dates when approved.`);
    } else {
      if (source.review_by <= source.last_human_verified_on) {
        addError(`${label}.review_by must be after last_human_verified_on.`);
      }
      if (source.review_by < dataset.research_checked_on) {
        addError(`${label} is already past its review_by date.`);
      }
    }
  }
});

const evidenceById = new Map();
const usedSourceIds = new Set();
evidence.forEach((record, index) => {
  const label = `evidence[${index}]`;
  if (!nonEmptyString(record.id) || !slugPattern.test(record.id)) {
    addError(`${label}.id must be a stable kebab-case identifier.`);
  } else if (evidenceById.has(record.id)) {
    addError(`${label}.id duplicates ${record.id}.`);
  } else {
    evidenceById.set(record.id, record);
  }
  if (!sourceById.has(record.source_id)) {
    addError(`${label}.source_id does not reference a source.`);
  } else {
    usedSourceIds.add(record.source_id);
  }
  if (!expectedCategoryIds.has(record.category_id)) {
    addError(`${label}.category_id does not reference a selected category.`);
  }
  ["locator", "supporting_summary", "claim_scope"].forEach((field) => {
    if (!nonEmptyString(record[field])) addError(`${label}.${field} must be a non-placeholder string.`);
  });
  if (!validDate(record.research_checked_on)) {
    addError(`${label}.research_checked_on must use a valid YYYY-MM-DD date.`);
  } else if (record.research_checked_on !== dataset.research_checked_on) {
    addError(`${label}.research_checked_on must match the dataset research date.`);
  }
  if (!allowedReviewStates.has(record.review_status)) {
    addError(`${label}.review_status is not allowlisted.`);
  }
  if (record.review_status === "pending_human_review") {
    if (record.human_reviewed_on !== null || record.reviewer_ref !== null) {
      addError(`${label} cannot claim a human review while pending human review.`);
    }
  } else if (record.review_status === "approved") {
    if (!validDate(record.human_reviewed_on) || !nonEmptyString(record.reviewer_ref)) {
      addError(`${label} requires a human review date and reviewer reference when approved.`);
    }
  }
});
for (const sourceId of sourceById.keys()) {
  if (!usedSourceIds.has(sourceId)) addError(`Source ${sourceId} is not referenced by evidence.`);
}

const categoryById = new Map();
const aliasesToCategories = new Map();
const referencedEvidenceIds = new Set();
categories.forEach((category, index) => {
  const label = `categories[${index}]`;
  if (!nonEmptyString(category.id) || !slugPattern.test(category.id)) {
    addError(`${label}.id must be a stable kebab-case identifier.`);
  } else if (categoryById.has(category.id)) {
    addError(`${label}.id duplicates ${category.id}.`);
  } else {
    categoryById.set(category.id, category);
  }
  if (!expectedCategoryIds.has(category.id)) {
    addError(`${label}.id is not in the selected BL-002 set.`);
  }
  ["display_name", "description"].forEach((field) => {
    if (!nonEmptyString(category[field])) addError(`${label}.${field} must be a non-placeholder string.`);
  });
  if (!allowedReviewStates.has(category.review_status)) {
    addError(`${label}.review_status is not allowlisted.`);
  }
  if (category.review_status === "pending_human_review" && category.active !== false) {
    addError(`${label} must remain inactive until human approval.`);
  }
  validateStringArray(category.known_limitations, `${label}.known_limitations`, { allowEmpty: false });

  if (!Array.isArray(category.aliases) || category.aliases.length === 0) {
    addError(`${label}.aliases must contain at least one alias.`);
  } else {
    const localAliases = new Set();
    category.aliases.forEach((alias, aliasIndex) => {
      const aliasLabel = `${label}.aliases[${aliasIndex}]`;
      if (!nonEmptyString(alias.alias) || !nonEmptyString(alias.normalized_alias)) {
        addError(`${aliasLabel} requires non-placeholder alias and normalized_alias values.`);
        return;
      }
      if (alias.normalized_alias !== normalizeAlias(alias.alias)) {
        addError(`${aliasLabel}.normalized_alias does not match the documented normalization algorithm.`);
      }
      if (alias.locale !== "en") addError(`${aliasLabel}.locale must be "en" for V1.`);
      if (alias.review_status !== category.review_status) {
        addError(`${aliasLabel}.review_status must match its category.`);
      }
      if (localAliases.has(alias.normalized_alias)) {
        addError(`${aliasLabel}.normalized_alias duplicates an alias within its category.`);
      }
      localAliases.add(alias.normalized_alias);
      const categorySet = aliasesToCategories.get(alias.normalized_alias) ?? new Set();
      categorySet.add(category.id);
      aliasesToCategories.set(alias.normalized_alias, categorySet);
    });
  }

  const guidance = category.guidance;
  if (!guidance || typeof guidance !== "object" || Array.isArray(guidance)) {
    addError(`${label}.guidance must be an object.`);
  } else {
    ["action_summary", "where_summary"].forEach((field) => {
      if (!nonEmptyString(guidance[field])) addError(`${label}.guidance.${field} must be a non-placeholder string.`);
    });
    validateStringArray(guidance.requirements, `${label}.guidance.requirements`, { allowEmpty: false });
    if (!nonEmptyString(guidance.escalation_url)) {
      addError(`${label}.guidance.escalation_url must be a non-placeholder official URL.`);
    } else {
      governmentUrlInfo(guidance.escalation_url, `${label}.guidance.escalation_url`);
    }
    if (guidance.review_status !== category.review_status) {
      addError(`${label}.guidance.review_status must match its category.`);
    }
    if (guidance.review_status === "pending_human_review" && guidance.active !== false) {
      addError(`${label}.guidance must remain inactive until human approval.`);
    }
    if (!Array.isArray(guidance.evidence_ids) || guidance.evidence_ids.length === 0) {
      addError(`${label}.guidance.evidence_ids must not be empty.`);
    } else {
      const uniqueEvidenceIds = new Set(guidance.evidence_ids);
      if (uniqueEvidenceIds.size !== guidance.evidence_ids.length) {
        addError(`${label}.guidance.evidence_ids contains duplicates.`);
      }
      guidance.evidence_ids.forEach((evidenceId) => {
        const record = evidenceById.get(evidenceId);
        if (!record) addError(`${label}.guidance references missing evidence ${evidenceId}.`);
        else if (record.category_id !== category.id) {
          addError(`${label}.guidance evidence ${evidenceId} belongs to another category.`);
        } else {
          referencedEvidenceIds.add(evidenceId);
        }
      });
    }
  }
});

for (const expectedId of expectedCategoryIds) {
  if (!categoryById.has(expectedId)) addError(`Missing selected category: ${expectedId}.`);
}
evidence.forEach((record) => {
  if (!categoryById.has(record.category_id)) {
    addError(`${record.id} references a category not present in categories.`);
  }
  if (!referencedEvidenceIds.has(record.id)) {
    addError(`${record.id} is not referenced by its category guidance.`);
  }
});

const declaredCollisions = new Map();
if (!Array.isArray(dataset.intentional_alias_collisions)) {
  addError("intentional_alias_collisions must be an array.");
} else {
  dataset.intentional_alias_collisions.forEach((collision, index) => {
    const label = `intentional_alias_collisions[${index}]`;
    if (!nonEmptyString(collision.normalized_alias)) {
      addError(`${label}.normalized_alias must be a non-placeholder string.`);
      return;
    }
    if (collision.normalized_alias !== normalizeAlias(collision.normalized_alias)) {
      addError(`${label}.normalized_alias must already be normalized.`);
    }
    if (declaredCollisions.has(collision.normalized_alias)) {
      addError(`${label} duplicates a collision declaration.`);
    }
    const ids = Array.isArray(collision.category_ids) ? collision.category_ids : [];
    if (ids.length < 2 || new Set(ids).size !== ids.length || ids.some((id) => !expectedCategoryIds.has(id))) {
      addError(`${label}.category_ids must list at least two unique selected category IDs.`);
    }
    if (collision.behavior !== "ambiguous") {
      addError(`${label}.behavior must be "ambiguous".`);
    }
    ["clarification_prompt", "reason"].forEach((field) => {
      if (!nonEmptyString(collision[field])) addError(`${label}.${field} must be a non-placeholder string.`);
    });
    declaredCollisions.set(collision.normalized_alias, new Set(ids));
  });
}

for (const [alias, categoryIds] of aliasesToCategories) {
  if (categoryIds.size < 2) continue;
  const declared = declaredCollisions.get(alias);
  if (!declared) {
    addError(`Alias collision ${alias} is not intentionally declared.`);
    continue;
  }
  const actualIds = [...categoryIds].sort();
  const declaredIds = [...declared].sort();
  if (actualIds.join("|") !== declaredIds.join("|")) {
    addError(`Alias collision ${alias} does not match its declared category IDs.`);
  }
}
for (const [alias] of declaredCollisions) {
  if ((aliasesToCategories.get(alias)?.size ?? 0) < 2) {
    addError(`Declared collision ${alias} is not an actual multi-category alias.`);
  }
}

if (!Array.isArray(dataset.excluded_or_deferred) || dataset.excluded_or_deferred.length === 0) {
  addError("excluded_or_deferred must document at least one bounded exclusion or deferral.");
} else {
  dataset.excluded_or_deferred.forEach((entry, index) => {
    if (!nonEmptyString(entry.item_group) || !nonEmptyString(entry.reason)) {
      addError(`excluded_or_deferred[${index}] requires item_group and reason.`);
    }
  });
}

const productionEligibleCategories = categories.filter((category) => {
  if (!category.active || category.review_status !== "approved") return false;
  if (!category.guidance.active || category.guidance.review_status !== "approved") return false;
  return category.guidance.evidence_ids.every((evidenceId) => {
    const record = evidenceById.get(evidenceId);
    const source = record ? sourceById.get(record.source_id) : null;
    return record?.review_status === "approved" && source?.review_status === "approved";
  });
});
const productionEligibleIds = new Set(productionEligibleCategories.map((category) => category.id));
categories.forEach((category) => {
  if (category.active && !productionEligibleIds.has(category.id)) {
    addError(`Active category ${category.id} is not fully approved with approved evidence and sources.`);
  }
});
if (dataset.status === "pending_human_review" && productionEligibleCategories.length !== 0) {
  addError("A pending dataset must have zero production-eligible categories.");
}
if (dataset.status === "approved" && productionEligibleCategories.length !== categories.length) {
  addError("An approved dataset must make every selected category production-eligible.");
}

findPlaceholderStrings(dataset);

if (errors.length > 0) {
  console.error(`V1 dataset validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const aliasCount = categories.reduce((total, category) => total + category.aliases.length, 0);
console.log("V1 canonical dataset candidate validation passed.");
console.log(`Categories: ${categories.length}`);
console.log(`Aliases: ${aliasCount}`);
console.log(`Sources: ${sources.length}`);
console.log(`Evidence records: ${evidence.length}`);
console.log(`Intentional alias collisions: ${declaredCollisions.size}`);
console.log(`Production-eligible categories before human approval: ${productionEligibleCategories.length}`);
