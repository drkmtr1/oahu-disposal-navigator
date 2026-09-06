import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import test from "node:test";

import { createDisposalPostHandler } from "../lib/disposal/http.ts";

const dataset = JSON.parse(
  await readFile(new URL("../data/v1-canonical-dataset.json", import.meta.url), "utf8"),
);
const handler = createDisposalPostHandler({
  requestIdFactory: () => "integration-request",
  today: () => "2026-09-06",
});

function request(item) {
  return new Request("http://localhost/api/disposal-options", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ item }),
  });
}

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
    verifiedOn: source.last_human_verified_on,
  });
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
