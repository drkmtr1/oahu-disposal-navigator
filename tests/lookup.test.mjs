import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";

import {
  MAX_ITEM_CHARACTERS,
  normalizeItemInput,
  resolveDisposalLookup,
} from "../lib/disposal/domain.ts";
import { createDisposalPostHandler } from "../lib/disposal/http.ts";
import { createSupabaseLookupRows } from "../lib/disposal/supabase.ts";

const TODAY = "2026-09-06";

function lookupRow(overrides = {}) {
  return {
    category_id: "mattresses",
    category_name: "Mattresses",
    alias: "old mattress",
    normalized_alias: "old mattress",
    locale: "en",
    guidance_id: "00000000-0000-4000-8000-000000000001",
    action_summary: "Take the mattress to an applicable City resident waste-drop-off facility.",
    requirements: ["Bag the mattress when possible."],
    where_summary: "An applicable City resident waste-drop-off facility.",
    escalation_url: "https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/",
    source_id: "src-city-resident-drop-off",
    source_organization: "City and County of Honolulu Department of Environmental Services",
    source_title: "Rules and Guidelines for Residents",
    source_url: "https://www.honolulu.gov/env/ref/waste-drop-off-rules-residents/",
    source_apparent_updated_on: "2025-04-22",
    source_verified_on: "2026-09-05",
    source_review_by: "2026-12-04",
    evidence_id: "ev-mattresses-drop-off",
    evidence_summary: "The reviewed source lists mattresses as regular refuse.",
    evidence_locator: "Regular Refuse",
    evidence_claim_scope: "Oʻahu residential mattress drop-off.",
    evidence_reviewed_on: "2026-09-05",
    ...overrides,
  };
}

function jsonRequest(body, headers = {}) {
  return new Request("http://localhost/api/disposal-options", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function batteryRows() {
  const categories = [
    ["alkaline-and-single-use-batteries", "Alkaline and single-use batteries"],
    ["standalone-rechargeable-batteries", "Standalone rechargeable batteries"],
    ["car-and-motorcycle-lead-acid-batteries", "Car and motorcycle lead-acid batteries"],
  ];

  return categories.map(([category_id, category_name], index) =>
    lookupRow({
      category_id,
      category_name,
      alias: "battery",
      normalized_alias: "battery",
      guidance_id: `00000000-0000-4000-8000-00000000000${index + 2}`,
      source_id: `source-${index}`,
      evidence_id: `evidence-${index}`,
    }),
  );
}

test("BL-005 / AC-FR-002-01 normalizes Unicode, dash variants, case, and whitespace", () => {
  assert.deepEqual(normalizeItemInput("  OLD\u2013MATTRESS\t "), {
    ok: true,
    normalizedItem: "old-mattress",
  });
  assert.deepEqual(normalizeItemInput("ＡＡ battery"), {
    ok: true,
    normalizedItem: "aa battery",
  });
  assert.equal(normalizeItemInput("a".repeat(MAX_ITEM_CHARACTERS)).ok, true);
});

test("BL-005 / AC-FR-002-02 rejects invalid input before repository access", async () => {
  for (const value of ["", " \n\t ", "\u0000\u0007", "---", 42, null, "a".repeat(201)]) {
    let calls = 0;
    const result = await resolveDisposalLookup(
      value,
      async () => {
        calls += 1;
        return [];
      },
      { today: TODAY },
    );
    assert.equal(result.ok, false);
    assert.equal(calls, 0);
  }
});

test("BL-005 / AC-FR-003-01 and AC-FR-005-01 return stored reviewed guidance with zero model calls", async () => {
  let repositoryCalls = 0;
  const result = await resolveDisposalLookup(
    "  OLD MATTRESS ",
    async (normalizedAlias) => {
      repositoryCalls += 1;
      assert.equal(normalizedAlias, "old mattress");
      return [lookupRow()];
    },
    { today: TODAY },
  );

  assert.equal(repositoryCalls, 1);
  assert.equal(result.status, "success");
  assert.deepEqual(result.category, { id: "mattresses", name: "Mattresses" });
  assert.equal(result.guidance.action, lookupRow().action_summary);
  assert.deepEqual(result.guidance.requirements, lookupRow().requirements);
  assert.equal(result.source.url, lookupRow().source_url);
  assert.equal(result.source.apparentUpdatedOn, "2025-04-22");
  assert.equal(result.source.verifiedOn, "2026-09-05");
  assert.equal(result.source.reviewBy, "2026-12-04");
  assert.deepEqual(result.evidence, [
    {
      id: "ev-mattresses-drop-off",
      summary: "The reviewed source lists mattresses as regular refuse.",
      locator: "Regular Refuse",
      claimScope: "Oʻahu residential mattress drop-off.",
      reviewedOn: "2026-09-05",
    },
  ]);
  assert.equal(result.trustMessage, "Disposal rules come from official sources.");
});

test("BL-005 / AC-FR-003-02 returns bounded ambiguity without guidance", async () => {
  const result = await resolveDisposalLookup(
    "battery",
    async () => batteryRows(),
    { today: TODAY },
  );

  assert.equal(result.status, "ambiguous");
  assert.equal(result.candidates.length, 3);
  assert.equal(result.allowUnsure, true);
  assert.match(result.fallback.url, /^https:\/\/www\.honolulu\.gov\//);
  assert.equal("guidance" in result, false);
  assert.equal("source" in result, false);
});

test("BL-006 / AC-FR-008-02 accepts only a clarification candidate from the original match", async () => {
  const selected = await resolveDisposalLookup(
    "battery",
    async () => batteryRows(),
    {
      today: TODAY,
      selectedCategoryId: "standalone-rechargeable-batteries",
    },
  );
  assert.equal(selected.status, "success");
  assert.equal(selected.category.id, "standalone-rechargeable-batteries");

  const invented = await resolveDisposalLookup(
    "battery",
    async () => batteryRows(),
    { today: TODAY, selectedCategoryId: "mattresses" },
  );
  assert.equal(invented.status, "unsupported");
  assert.equal("guidance" in invented, false);
});

test("BL-005 / AC-FR-009-01 safely abstains on unmatched and over-broad ambiguity", async () => {
  const unmatched = await resolveDisposalLookup("paint", async () => [], { today: TODAY });
  assert.equal(unmatched.status, "unsupported");
  assert.equal(unmatched.reasonCode, "UNSUPPORTED");
  assert.equal("guidance" in unmatched, false);
  assert.match(unmatched.fallback.url, /^https:\/\/www\.honolulu\.gov\//);

  const tooMany = await resolveDisposalLookup(
    "item",
    async () =>
      Array.from({ length: 5 }, (_, index) =>
        lookupRow({
          category_id: `category-${index}`,
          category_name: `Category ${index}`,
          alias: "item",
          normalized_alias: "item",
          guidance_id: `guidance-${index}`,
          source_id: `source-${index}`,
          evidence_id: `evidence-${index}`,
        }),
      ),
    { today: TODAY },
  );
  assert.equal(tooMany.status, "unsupported");
  assert.equal("candidates" in tooMany, false);

  const bypassAttempt = await resolveDisposalLookup(
    "item",
    async () =>
      Array.from({ length: 5 }, (_, index) =>
        lookupRow({
          category_id: `category-${index}`,
          category_name: `Category ${index}`,
          alias: "item",
          normalized_alias: "item",
          guidance_id: `guidance-${index}`,
          source_id: `source-${index}`,
          evidence_id: `evidence-${index}`,
        }),
      ),
    { today: TODAY, selectedCategoryId: "category-0" },
  );
  assert.equal(bypassAttempt.status, "unsupported");
  assert.equal("guidance" in bypassAttempt, false);
});

test("BL-007 / AC-FR-013-01 rejects missing, stale, future-dated, or inconsistent evidence", async () => {
  for (const rows of [
    [lookupRow({ evidence_summary: "" })],
    [lookupRow({ source_review_by: "2026-09-05" })],
    [lookupRow({ source_verified_on: "2026-09-07" })],
    [lookupRow({ evidence_reviewed_on: "2026-09-07" })],
    [lookupRow({ source_apparent_updated_on: "2026-09-07" })],
    [lookupRow({ source_review_by: "2026-09-04" })],
    [lookupRow({ source_url: "https://example.com/not-authoritative" })],
    [lookupRow(), lookupRow({ source_id: "different-source" })],
    [lookupRow(), lookupRow({ source_review_by: "2026-12-05" })],
    [lookupRow(), lookupRow({ evidence_summary: "Conflicting evidence summary." })],
  ]) {
    const result = await resolveDisposalLookup("old mattress", async () => rows, {
      today: TODAY,
    });
    assert.equal(result.status, "unsupported");
    assert.equal(result.reasonCode, "EVIDENCE_UNAVAILABLE");
    assert.equal("guidance" in result, false);
  }
});

test("BL-005 / AC-FR-010-01 returns a retryable database error without leaked details", async () => {
  const result = await resolveDisposalLookup(
    "old mattress",
    async () => {
      throw new Error("postgres://user:secret@example.invalid private SQL");
    },
    { today: TODAY },
  );

  assert.deepEqual(result, {
    status: "error",
    reasonCode: "DATABASE_UNAVAILABLE",
    retryable: true,
    message: "Disposal guidance is temporarily unavailable. Please try again.",
  });
  assert.doesNotMatch(JSON.stringify(result), /secret|postgres|SQL/i);
});

test("BL-005 API contract accepts one bounded JSON item", async () => {
  let repositoryCalls = 0;
  const handler = createDisposalPostHandler({
    lookupRows: async () => {
      repositoryCalls += 1;
      return [lookupRow()];
    },
    requestIdFactory: () => "request-test-1",
    today: () => TODAY,
  });
  const response = await handler(jsonRequest({ item: "old mattress" }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(body.requestId, "request-test-1");
  assert.equal(body.status, "success");
  assert.equal(repositoryCalls, 1);
});

test("BL-006 / AC-FR-008-02 API contract accepts one bounded clarification choice", async () => {
  const handler = createDisposalPostHandler({
    lookupRows: async () => batteryRows(),
    requestIdFactory: () => "request-clarification",
    today: () => TODAY,
  });
  const response = await handler(
    jsonRequest({
      item: "battery",
      selectedCategoryId: "car-and-motorcycle-lead-acid-batteries",
    }),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
  assert.equal(body.category.id, "car-and-motorcycle-lead-acid-batteries");
});

test("BL-005 / AC-FR-002-01 accepts 200 meaningful characters even when JSON-escaped", async () => {
  let repositoryCalls = 0;
  const handler = createDisposalPostHandler({
    lookupRows: async () => {
      repositoryCalls += 1;
      return [];
    },
    requestIdFactory: () => "request-escaped",
    today: () => TODAY,
  });
  const escapedItem = "\\u0061".repeat(MAX_ITEM_CHARACTERS);
  const response = await handler(jsonRequest(`{\"item\":\"${escapedItem}\"}`));

  assert.equal(response.status, 200);
  assert.equal(repositoryCalls, 1);
});

test("BL-005 API contract rejects malformed shape, media type, and invalid input before lookup", async () => {
  let repositoryCalls = 0;
  const handler = createDisposalPostHandler({
    lookupRows: async () => {
      repositoryCalls += 1;
      return [];
    },
    requestIdFactory: () => "request-invalid",
    today: () => TODAY,
  });
  const cases = [
    jsonRequest("{"),
    jsonRequest({ item: "mattress", category: "mattresses" }),
    jsonRequest({ item: "battery", selectedCategoryId: "Not a canonical ID" }),
    jsonRequest({ category: "mattresses" }),
    jsonRequest({ item: "" }),
    new Request("http://localhost/api/disposal-options", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "mattress",
    }),
  ];

  for (const request of cases) {
    const response = await handler(request);
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.status, "error");
    assert.equal(body.reasonCode, "INVALID_INPUT");
    assert.equal("guidance" in body, false);
  }
  assert.equal(repositoryCalls, 0);
});

test("BL-005 API contract enforces the request-body byte limit", async () => {
  let repositoryCalls = 0;
  const handler = createDisposalPostHandler({
    lookupRows: async () => {
      repositoryCalls += 1;
      return [];
    },
    requestIdFactory: () => "request-large",
  });
  const response = await handler(jsonRequest({ item: "a".repeat(4_100) }));
  const body = await response.json();

  assert.equal(response.status, 413);
  assert.equal(body.reasonCode, "INVALID_INPUT");
  assert.equal(repositoryCalls, 0);
});

test("BL-005 API contract maps dependency failure to HTTP 503", async () => {
  const handler = createDisposalPostHandler({
    lookupRows: async () => {
      throw new Error("database detail");
    },
    requestIdFactory: () => "request-db-failure",
    today: () => TODAY,
  });
  const response = await handler(jsonRequest({ item: "old mattress" }));
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.reasonCode, "DATABASE_UNAVAILABLE");
  assert.equal(body.retryable, true);
  assert.equal("guidance" in body, false);
  assert.doesNotMatch(JSON.stringify(body), /database detail/i);
});

test("BL-005 Supabase adapter uses the dedicated API schema and publishable-key header", async () => {
  let capturedUrl;
  let capturedOptions;
  const lookupRows = createSupabaseLookupRows({
    url: "https://project-ref.supabase.co",
    publishableKey: "sb_publishable_test-value",
    timeoutMs: 500,
    fetchImpl: async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return Response.json([lookupRow()]);
    },
  });

  const result = await lookupRows("old mattress");
  assert.equal(result.length, 1);
  assert.equal(capturedUrl.origin, "https://project-ref.supabase.co");
  assert.equal(capturedUrl.pathname, "/rest/v1/disposal_lookup");
  assert.equal(capturedUrl.searchParams.get("normalized_alias"), "eq.old mattress");
  assert.match(capturedUrl.searchParams.get("select"), /source_apparent_updated_on/);
  assert.equal(capturedUrl.searchParams.get("limit"), "32");
  assert.equal(capturedOptions.headers["Accept-Profile"], "api");
  assert.equal(capturedOptions.headers.apikey, "sb_publishable_test-value");
  assert.equal("Authorization" in capturedOptions.headers, false);
  assert.equal(capturedOptions.cache, "no-store");
  assert.equal(capturedOptions.redirect, "error");
});

test("BL-005 Supabase adapter rejects unsafe configuration and invalid responses", async () => {
  for (const configuration of [
    { url: undefined, publishableKey: "key" },
    { url: "https://project.supabase.co", publishableKey: undefined },
    { url: "http://project.supabase.co", publishableKey: "key" },
    { url: "https://user:password@project.supabase.co", publishableKey: "key" },
  ]) {
    assert.throws(() => createSupabaseLookupRows(configuration));
  }

  const nonSuccess = createSupabaseLookupRows({
    url: "http://127.0.0.1:54321",
    publishableKey: "local-key",
    fetchImpl: async () => Response.json({ message: "private detail" }, { status: 503 }),
  });
  await assert.rejects(nonSuccess("old mattress"), /Supabase lookup failed/);

  let legacyHeaders;
  const legacy = createSupabaseLookupRows({
    url: "http://127.0.0.1:54321",
    publishableKey: "eyJlegacy-anon-jwt",
    fetchImpl: async (_url, options) => {
      legacyHeaders = options.headers;
      return Response.json([]);
    },
  });
  await legacy("old mattress");
  assert.equal(legacyHeaders.apikey, "eyJlegacy-anon-jwt");
  assert.equal(legacyHeaders.Authorization, "Bearer eyJlegacy-anon-jwt");

  const malformed = createSupabaseLookupRows({
    url: "http://localhost:54321",
    publishableKey: "local-key",
    fetchImpl: async () => Response.json({ not: "an array" }),
  });
  await assert.rejects(malformed("old mattress"), /invalid row set/);
});

test("BL-005 / NFR-007 records a bounded local deterministic latency sample", async () => {
  const durations = [];
  for (let index = 0; index < 100; index += 1) {
    const started = performance.now();
    const result = await resolveDisposalLookup("old mattress", async () => [lookupRow()], {
      today: TODAY,
    });
    durations.push(performance.now() - started);
    assert.equal(result.status, "success");
  }

  durations.sort((left, right) => left - right);
  const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
  assert.ok(p95 < 1_500, `local deterministic p95 was ${p95.toFixed(2)} ms`);
});
