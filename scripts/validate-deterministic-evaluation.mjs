import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const CASES_URL = new URL(
  "../data/evaluation/deterministic-baseline-cases.json",
  import.meta.url,
);
const DATASET_URL = new URL("../data/v1-canonical-dataset.json", import.meta.url);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^db-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_SUBSETS = new Set(["development", "holdout"]);
const ALLOWED_CASE_TYPES = new Set([
  "canonical_alias",
  "supported_ordinary_language",
  "supported_misspelling",
  "ambiguous",
  "unsupported_household",
  "out_of_scope",
  "hazardous_uncertainty",
  "invalid_input",
  "prompt_injection",
  "failure_simulation",
]);
const ALLOWED_DECISIONS = new Set([
  "success",
  "ambiguous",
  "unsupported",
  "invalid",
  "evidence_unavailable",
  "database_error",
]);
const ALLOWED_SIMULATIONS = new Set([
  "none",
  "stale_source",
  "malformed_evidence",
  "future_source",
  "database_failure",
]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim() === value && value.length > 0;
}

function validDate(value) {
  if (!nonEmptyString(value) || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function normalized(value) {
  return value
    .normalize("NFKC")
    .replace(/[\u2010-\u2015\u2212]/gu, "-")
    .replace(/\s+/gu, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

export async function loadEvaluationInputs() {
  const [evaluation, canonical] = await Promise.all([
    readFile(CASES_URL, "utf8").then(JSON.parse),
    readFile(DATASET_URL, "utf8").then(JSON.parse),
  ]);
  return { evaluation, canonical };
}

export function validateEvaluationDataset(evaluation, canonical) {
  const errors = [];
  const add = (message) => errors.push(message);

  if (!isRecord(evaluation)) return ["Evaluation root must be an object."];
  if (evaluation.schema_version !== "1.0.0") add('schema_version must be "1.0.0".');
  if (evaluation.evaluation_id !== "deterministic-baseline-v1") {
    add('evaluation_id must be "deterministic-baseline-v1".');
  }
  if (!validDate(evaluation.evaluation_date)) add("evaluation_date must be YYYY-MM-DD.");
  if (!new Set(["pending_human_review", "approved"]).has(evaluation.status)) {
    add("status must be pending_human_review or approved.");
  }
  if (evaluation.source_data_version !== canonical.data_version) {
    add("source_data_version must match the canonical dataset.");
  }
  if (!nonEmptyString(evaluation.split_policy)) add("split_policy is required.");

  if (!isRecord(evaluation.review) || evaluation.review.human_review_required !== true) {
    add("review must require independent human review.");
  } else if (evaluation.status === "approved") {
    if (!nonEmptyString(evaluation.review.reviewer_ref)) {
      add("An approved set requires review.reviewer_ref.");
    }
    if (!validDate(evaluation.review.reviewed_on)) {
      add("An approved set requires review.reviewed_on.");
    }
  } else if (
    evaluation.review.reviewer_ref !== null ||
    evaluation.review.reviewed_on !== null
  ) {
    add("A pending set cannot claim completed human review.");
  }
  if (!nonEmptyString(evaluation.review?.scope)) add("review.scope is required.");

  const cases = Array.isArray(evaluation.cases) ? evaluation.cases : [];
  if (!Array.isArray(evaluation.cases)) add("cases must be an array.");
  if (evaluation.case_count !== cases.length) add("case_count must equal cases.length.");
  if (cases.length < 100) add("The baseline must contain at least 100 bounded cases.");

  const categoryIds = new Set(canonical.categories.map((category) => category.id));
  const aliasCategories = new Map();
  for (const category of canonical.categories) {
    for (const alias of category.aliases) {
      const ids = aliasCategories.get(alias.normalized_alias) ?? [];
      ids.push(category.id);
      aliasCategories.set(alias.normalized_alias, ids);
    }
  }

  const ids = new Set();
  const canonicalInputs = new Map();
  const subsetCounts = new Map();
  for (const [index, candidate] of cases.entries()) {
    const label = `cases[${index}]`;
    if (!isRecord(candidate)) {
      add(`${label} must be an object.`);
      continue;
    }
    if (!nonEmptyString(candidate.id) || !ID_PATTERN.test(candidate.id)) {
      add(`${label}.id must be a stable db-prefixed kebab-case ID.`);
    } else if (ids.has(candidate.id)) {
      add(`${label}.id duplicates ${candidate.id}.`);
    } else {
      ids.add(candidate.id);
    }
    if (!ALLOWED_SUBSETS.has(candidate.subset)) add(`${label}.subset is not allowlisted.`);
    else subsetCounts.set(candidate.subset, (subsetCounts.get(candidate.subset) ?? 0) + 1);
    if (!ALLOWED_CASE_TYPES.has(candidate.case_type)) {
      add(`${label}.case_type is not allowlisted.`);
    }
    if (typeof candidate.critical_safety !== "boolean") {
      add(`${label}.critical_safety must be boolean.`);
    }
    if (!nonEmptyString(candidate.rationale)) add(`${label}.rationale is required.`);
    if (candidate.source_data_version !== canonical.data_version) {
      add(`${label}.source_data_version must match canonical data.`);
    }
    if (!ALLOWED_SIMULATIONS.has(candidate.simulation)) {
      add(`${label}.simulation is not allowlisted.`);
    }
    if (candidate.case_type === "failure_simulation" && candidate.simulation === "none") {
      add(`${label} failure simulation requires a simulation mode.`);
    }
    if (candidate.case_type !== "failure_simulation" && candidate.simulation !== "none") {
      add(`${label} non-failure case cannot set a simulation mode.`);
    }

    const expected = candidate.expected;
    if (!isRecord(expected) || !ALLOWED_DECISIONS.has(expected.decision)) {
      add(`${label}.expected.decision is invalid.`);
      continue;
    }
    const candidateIds = Array.isArray(expected.candidate_category_ids)
      ? expected.candidate_category_ids
      : [];
    if (!Array.isArray(expected.candidate_category_ids)) {
      add(`${label}.expected.candidate_category_ids must be an array.`);
    } else if (candidateIds.some((id) => !categoryIds.has(id))) {
      add(`${label}.expected.candidate_category_ids must be canonical IDs.`);
    }
    if (new Set(candidateIds).size !== candidateIds.length) {
      add(`${label}.expected.candidate_category_ids must be unique.`);
    }
    if (expected.decision === "success") {
      if (!nonEmptyString(expected.category_id) || !CATEGORY_PATTERN.test(expected.category_id)) {
        add(`${label} success requires category_id.`);
      } else if (!categoryIds.has(expected.category_id)) {
        add(`${label}.expected.category_id is not canonical.`);
      }
      if (candidateIds.length !== 0) add(`${label} success cannot include candidates.`);
    } else if (expected.decision === "ambiguous") {
      if (expected.category_id !== null || candidateIds.length < 2 || candidateIds.length > 4) {
        add(`${label} ambiguity requires two to four candidates and no category_id.`);
      }
    } else if (expected.category_id !== null || candidateIds.length !== 0) {
      add(`${label} non-success decision cannot include category IDs.`);
    }

    if (candidate.case_type !== "invalid_input" && typeof candidate.input !== "string") {
      add(`${label}.input must be a string outside invalid-input cases.`);
    }
    if (candidate.case_type === "canonical_alias" || candidate.case_type === "ambiguous") {
      if (typeof candidate.input !== "string") continue;
      const input = normalized(candidate.input);
      if (canonicalInputs.has(input)) add(`${label} duplicates canonical input ${input}.`);
      canonicalInputs.set(input, candidate);
      const expectedIds = [...(aliasCategories.get(input) ?? [])].sort();
      if (expectedIds.length === 0) add(`${label} is not a canonical alias.`);
      if (expectedIds.length === 1 && expected.category_id !== expectedIds[0]) {
        add(`${label} has the wrong canonical category.`);
      }
      if (
        expectedIds.length > 1 &&
        JSON.stringify([...candidateIds].sort()) !== JSON.stringify(expectedIds)
      ) {
        add(`${label} has the wrong canonical ambiguity candidates.`);
      }
    }
    if (
      ["supported_ordinary_language", "supported_misspelling"].includes(
        candidate.case_type,
      ) &&
      typeof candidate.input === "string" &&
      aliasCategories.has(normalized(candidate.input))
    ) {
      add(`${label} must be unresolved by the frozen exact-alias baseline.`);
    }
  }

  for (const subset of ALLOWED_SUBSETS) {
    if ((subsetCounts.get(subset) ?? 0) === 0) add(`${subset} subset must not be empty.`);
  }
  for (const alias of aliasCategories.keys()) {
    if (!canonicalInputs.has(alias)) add(`Missing canonical alias case for ${alias}.`);
  }
  if (canonicalInputs.size !== aliasCategories.size) {
    add("Canonical alias case count must equal the unique approved alias count.");
  }

  return errors;
}

async function main() {
  const { evaluation, canonical } = await loadEvaluationInputs();
  const errors = validateEvaluationDataset(evaluation, canonical);
  if (errors.length > 0) {
    console.error(`Deterministic evaluation validation failed with ${errors.length} error(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  const casesBySubset = Object.groupBy(evaluation.cases, (candidate) => candidate.subset);
  const criticalCount = evaluation.cases.filter((candidate) => candidate.critical_safety).length;
  console.log("Deterministic evaluation case-set validation passed.");
  console.log(`Status: ${evaluation.status}`);
  console.log(`Cases: ${evaluation.cases.length}`);
  console.log(`Development: ${casesBySubset.development?.length ?? 0}`);
  console.log(`Holdout: ${casesBySubset.holdout?.length ?? 0}`);
  console.log(`Critical safety: ${criticalCount}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
