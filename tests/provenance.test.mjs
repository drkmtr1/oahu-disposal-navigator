import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveDisposalLookup } from "../lib/disposal/domain.ts";

const dataset = JSON.parse(
  await readFile(new URL("../data/v1-canonical-dataset.json", import.meta.url), "utf8"),
);
const TODAY = "2026-09-06";
const sources = new Map(dataset.sources.map((source) => [source.id, source]));
const evidence = new Map(
  dataset.evidence.map((record) => [record.category_id, record]),
);
const categories = new Map(
  dataset.categories.map((category) => [category.id, category]),
);
const categoriesByAlias = new Map();

for (const category of dataset.categories) {
  for (const alias of category.aliases) {
    const matches = categoriesByAlias.get(alias.normalized_alias) ?? [];
    matches.push({ category, alias });
    categoriesByAlias.set(alias.normalized_alias, matches);
  }
}

function lookupRows(normalizedAlias) {
  return (categoriesByAlias.get(normalizedAlias) ?? []).map(({ category, alias }) => {
    const record = evidence.get(category.id);
    const source = sources.get(record.source_id);
    return {
      category_id: category.id,
      category_name: category.display_name,
      alias: alias.alias,
      normalized_alias: alias.normalized_alias,
      locale: alias.locale,
      guidance_id: `guidance-${category.id}`,
      action_summary: category.guidance.action_summary,
      requirements: category.guidance.requirements,
      where_summary: category.guidance.where_summary,
      escalation_url: category.guidance.escalation_url,
      source_id: source.id,
      source_organization: source.organization,
      source_title: source.title,
      source_url: source.url,
      source_apparent_updated_on: source.apparent_updated_on,
      source_verified_on: source.last_human_verified_on,
      source_review_by: source.review_by,
      evidence_id: record.id,
      evidence_summary: record.supporting_summary,
      evidence_locator: record.locator,
      evidence_claim_scope: record.claim_scope,
      evidence_reviewed_on: record.human_reviewed_on,
    };
  });
}

test("BL-007 / AC-FR-005-01, AC-NFR-002-01, and AC-NFR-003-01 preserve every canonical instruction and citation association", async () => {
  let supportedCases = 0;
  let citedCases = 0;
  let unsupportedClaims = 0;

  for (const [alias, matches] of categoriesByAlias) {
    if (matches.length > 1) {
      const ambiguity = await resolveDisposalLookup(alias, async () => lookupRows(alias), {
        today: TODAY,
      });
      assert.equal(ambiguity.status, "ambiguous", alias);
    }

    for (const { category } of matches) {
      const result = await resolveDisposalLookup(alias, async () => lookupRows(alias), {
        today: TODAY,
        ...(matches.length > 1 ? { selectedCategoryId: category.id } : {}),
      });
      const record = evidence.get(category.id);
      const source = sources.get(record.source_id);

      assert.equal(result.status, "success", alias);
      assert.deepEqual(result.guidance, {
        action: category.guidance.action_summary,
        requirements: category.guidance.requirements,
        where: category.guidance.where_summary,
      });
      assert.deepEqual(result.source, {
        organization: source.organization,
        title: source.title,
        url: source.url,
        apparentUpdatedOn: source.apparent_updated_on,
        verifiedOn: source.last_human_verified_on,
        reviewBy: source.review_by,
      });
      assert.deepEqual(result.evidence, [
        {
          id: record.id,
          summary: record.supporting_summary,
          locator: record.locator,
          claimScope: record.claim_scope,
          reviewedOn: record.human_reviewed_on,
        },
      ]);

      supportedCases += 1;
      citedCases += result.evidence.length > 0 ? 1 : 0;
      unsupportedClaims +=
        result.guidance.action === category.guidance.action_summary &&
        JSON.stringify(result.guidance.requirements) ===
          JSON.stringify(category.guidance.requirements) &&
        result.guidance.where === category.guidance.where_summary
          ? 0
          : 1;
    }
  }

  assert.equal(categories.size, 15);
  assert.equal(supportedCases, 85);
  assert.equal(citedCases, supportedCases, "citation association must be 100%");
  assert.equal(unsupportedClaims, 0);
});

test("BL-007 / AC-NFR-003-01 critical excluded descriptions always abstain without disposal guidance", async () => {
  const criticalUnsupportedDescriptions = [
    "damaged battery",
    "swollen battery",
    "electric vehicle battery",
    "heavy equipment battery",
    "paint",
    "paint thinner",
    "commercial waste",
    "construction waste",
    "unlisted compressed gas container",
    "telephone",
  ];

  for (const item of criticalUnsupportedDescriptions) {
    const result = await resolveDisposalLookup(item, async (alias) => lookupRows(alias), {
      today: TODAY,
    });
    assert.equal(result.status, "unsupported", item);
    assert.equal(result.reasonCode, "UNSUPPORTED", item);
    assert.equal("guidance" in result, false, item);
    assert.equal("source" in result, false, item);
    assert.equal("evidence" in result, false, item);
  }
});
