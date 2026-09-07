import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import test from "node:test";

import { createDisposalPostHandler } from "../lib/disposal/http.ts";
import { createSupabaseLookupRows } from "../lib/disposal/supabase.ts";

const dataset = JSON.parse(
  await readFile(new URL("../data/v1-canonical-dataset.json", import.meta.url), "utf8"),
);
const handler = createDisposalPostHandler({
  eventLogger: () => {},
  rateLimiter: () => ({ allowed: true }),
  requestIdFactory: () => "integration-request",
  today: () => "2026-09-06",
});

function request(item, selectedCategoryId) {
  return new Request("http://localhost/api/disposal-options", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      item,
      ...(selectedCategoryId === undefined ? {} : { selectedCategoryId }),
    }),
  });
}

test("BL-005 local Supabase configuration reaches the dedicated lookup projection", async () => {
  const lookupRows = createSupabaseLookupRows({
    url: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  });

  const rows = await lookupRows("old mattress");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].category_id, "mattresses");
});

test("BL-005 / AC-FR-003-01 and AC-FR-005-01 traverse the local Data API with canonical provenance", async () => {
  const response = await handler(request("old mattress"));
  const body = await response.json();
  const category = dataset.categories.find((candidate) => candidate.id === "mattresses");
  const source = dataset.sources.find((candidate) =>
    dataset.evidence.some(
      (evidence) =>
        evidence.category_id === "mattresses" && evidence.source_id === candidate.id,
    ),
  );

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.deepEqual(body.category, {
    id: category.id,
    name: category.display_name,
  });
  assert.deepEqual(body.guidance, {
    action: category.guidance.action_summary,
    requirements: category.guidance.requirements,
    where: category.guidance.where_summary,
  });
  assert.deepEqual(body.source, {
    organization: source.organization,
    title: source.title,
    url: source.url,
    apparentUpdatedOn: source.apparent_updated_on,
    verifiedOn: source.last_human_verified_on,
    reviewBy: source.review_by,
  });
  const evidence = dataset.evidence.find(
    (candidate) => candidate.category_id === category.id,
  );
  assert.deepEqual(body.evidence, [
    {
      id: evidence.id,
      summary: evidence.supporting_summary,
      locator: evidence.locator,
      claimScope: evidence.claim_scope,
      reviewedOn: evidence.human_reviewed_on,
    },
  ]);
});

test("BL-007 / AC-FR-005-01, AC-FR-007-01, and AC-NFR-003-01 regress every reviewed alias and citation", async () => {
  const aliases = new Map();
  for (const category of dataset.categories) {
    for (const alias of category.aliases) {
      const categoryIds = aliases.get(alias.normalized_alias) ?? [];
      categoryIds.push(category.id);
      aliases.set(alias.normalized_alias, categoryIds);
    }
  }

  let successCount = 0;
  let citationCount = 0;
  for (const [alias, categoryIds] of aliases) {
    if (categoryIds.length > 1) {
      const ambiguityResponse = await handler(request(alias));
      const ambiguity = await ambiguityResponse.json();
      assert.equal(ambiguity.status, "ambiguous", alias);
      assert.deepEqual(
        ambiguity.candidates.map((candidate) => candidate.id).toSorted(),
        categoryIds.toSorted(),
        alias,
      );
    }

    for (const categoryId of categoryIds) {
      const response = await handler(
        request(alias, categoryIds.length > 1 ? categoryId : undefined),
      );
      const body = await response.json();
      const category = dataset.categories.find((candidate) => candidate.id === categoryId);
      const evidence = dataset.evidence.filter(
        (candidate) => candidate.category_id === categoryId,
      );
      const source = dataset.sources.find(
        (candidate) => candidate.id === evidence[0].source_id,
      );

      assert.equal(response.status, 200, alias);
      assert.equal(body.status, "success", alias);
      assert.deepEqual(body.guidance, {
        action: category.guidance.action_summary,
        requirements: category.guidance.requirements,
        where: category.guidance.where_summary,
      });
      assert.deepEqual(body.source, {
        organization: source.organization,
        title: source.title,
        url: source.url,
        apparentUpdatedOn: source.apparent_updated_on,
        verifiedOn: source.last_human_verified_on,
        reviewBy: source.review_by,
      });
      assert.deepEqual(
        body.evidence,
        evidence.map((record) => ({
          id: record.id,
          summary: record.supporting_summary,
          locator: record.locator,
          claimScope: record.claim_scope,
          reviewedOn: record.human_reviewed_on,
        })),
      );
      successCount += 1;
      citationCount += body.evidence.length > 0 ? 1 : 0;
    }
  }

  assert.equal(successCount, 85);
  assert.equal(citationCount, successCount);
});

test("BL-005 / AC-FR-003-02 traverses the local Data API for the reviewed battery ambiguity", async () => {
  const response = await handler(request("battery"));
  const body = await response.json();
  const expectedIds = dataset.intentional_alias_collisions[0].category_ids.toSorted();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ambiguous");
  assert.deepEqual(
    body.candidates.map((candidate) => candidate.id).toSorted(),
    expectedIds,
  );
  assert.equal(body.candidates.length, 3);
  assert.equal("guidance" in body, false);
});

test("BL-006 / AC-FR-008-02 retrieves the selected reviewed battery category", async () => {
  const categoryId = "standalone-rechargeable-batteries";
  const response = await handler(request("battery", categoryId));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.category.id, categoryId);
  assert.equal(body.source.organization.includes("City and County of Honolulu"), true);
});

test("BL-005 / AC-FR-009-01 traverses the local Data API and safely abstains for an excluded item", async () => {
  const response = await handler(request("paint"));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "unsupported");
  assert.equal(body.reasonCode, "UNSUPPORTED");
  assert.equal("guidance" in body, false);
  assert.equal("source" in body, false);
});

test("BL-005 / NFR-007 samples local route-to-database deterministic latency", async () => {
  const durations = [];
  for (let index = 0; index < 20; index += 1) {
    const started = performance.now();
    const response = await handler(request("old mattress"));
    durations.push(performance.now() - started);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, "success");
  }

  durations.sort((left, right) => left - right);
  const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
  assert.ok(p95 <= 1_500, `local Data API deterministic p95 was ${p95.toFixed(2)} ms`);
});
