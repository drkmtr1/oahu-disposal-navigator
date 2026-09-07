import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createDisposalPostHandler } from "../lib/disposal/http.ts";
import { createInMemoryRateLimiter } from "../lib/disposal/operations.ts";

function request(item = "old mattress", headers = {}) {
  return new Request("http://localhost/api/disposal-options", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ item }),
  });
}

test("BL-011 / AC-NFR-011-01 emits a bounded diagnostic event without raw input or secrets", async () => {
  const events = [];
  const handler = createDisposalPostHandler({
    eventLogger: (event) => events.push(event),
    lookupRows: async () => { throw new Error("private database detail secret-value"); },
    now: (() => { let value = 1_000; return () => (value += 7); })(),
    rateLimiter: () => ({ allowed: true }),
    requestIdFactory: () => "safe-request-id",
    today: () => "2026-09-07",
  });

  const response = await handler(request("resident secret description"));
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("x-request-id"), "safe-request-id");
  assert.equal(events.length, 1);
  assert.deepEqual(events[0], {
    event: "lookup_failed",
    timestamp: events[0].timestamp,
    requestId: "safe-request-id",
    applicationVersion: "unknown",
    environment: "unknown",
    route: "/api/disposal-options",
    operation: "retrieve",
    outcome: "error",
    reasonCode: "DATABASE_UNAVAILABLE",
    databaseAttempted: true,
    modelAttempted: false,
    totalDurationMs: 7,
    databaseDurationMs: 7,
    validationResult: "accepted",
    classificationPath: "deterministic",
    categoryId: null,
    sourceDataVersion: null,
    sourceReviewOutcome: "not_applicable",
    errorClass: "database",
    fallbackOutcome: "retry",
  });
  assert.match(events[0].timestamp, /^\d{4}-\d{2}-\d{2}T/);
  assert.doesNotMatch(JSON.stringify(events), /resident secret description|private database detail|secret-value/);
  assert.doesNotMatch(JSON.stringify(body), /resident secret description|private database detail|secret-value/);
});

test("BL-011 / AC-NFR-009-01 rejects invalid input without logging the raw item", async () => {
  const events = [];
  const handler = createDisposalPostHandler({
    eventLogger: (event) => events.push(event),
    lookupRows: async () => { throw new Error("must not run"); },
    rateLimiter: () => ({ allowed: true }),
    requestIdFactory: () => "invalid-request",
  });
  const response = await handler(request("personal name \u0000"));
  assert.equal(response.status, 400);
  assert.equal(events[0].validationResult, "rejected");
  assert.equal(events[0].databaseAttempted, false);
  assert.doesNotMatch(JSON.stringify(events), /personal name/);
});

test("BL-011 / API abuse contract returns a safe 429 and does not attempt the database", async () => {
  let databaseCalls = 0;
  const events = [];
  const limiter = createInMemoryRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 10 });
  const handler = createDisposalPostHandler({
    eventLogger: (event) => events.push(event),
    lookupRows: async () => { databaseCalls += 1; return []; },
    now: () => 10_000,
    rateLimiter: limiter,
    requestIdFactory: () => `request-${events.length + 1}`,
  });

  assert.equal((await handler(request())).status, 200);
  const response = await handler(request());
  const body = await response.json();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(body.reasonCode, "RATE_LIMITED");
  assert.equal(body.retryable, true);
  assert.equal(databaseCalls, 1);
  assert.equal(events.at(-1).event, "rate_limited");
});

test("BL-011 / AC-NFR-010-01 diagnostic failure cannot replace a safe response", async () => {
  const handler = createDisposalPostHandler({
    eventLogger: () => { throw new Error("logging unavailable"); },
    lookupRows: async () => { throw new Error("database unavailable"); },
    rateLimiter: () => ({ allowed: true }),
    requestIdFactory: () => "logging-failure",
  });
  const response = await handler(request());
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.reasonCode, "DATABASE_UNAVAILABLE");
  assert.equal("guidance" in body, false);
});

test("BL-011 / security-header gate configures browser hardening and hides framework identity", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  for (const header of [
    "Content-Security-Policy",
    "Referrer-Policy",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Permissions-Policy",
  ]) assert.match(config, new RegExp(header));
  assert.match(config, /poweredByHeader: false/);
});
