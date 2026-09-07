# API contracts

V1 needs one same-origin application boundary, not a separately marketed public REST API. BL-005 implements the route as an internal UI contract; it may change through documented version control.

## POST /api/disposal-options

**Purpose:** validate an item description, classify it, retrieve approved canonical guidance/provenance, and return exactly one response state.

**Authentication/authorization:** none for residents. Server-side database access uses least-privilege read-only grants and RLS. Maintenance writes are outside this API.

### Request

~~~json
{
  "item": "old mattress"
}
~~~

Content-Type application/json; the initial request has exactly one `item` field containing a string; 1–200 meaningful Unicode characters after normalization; maximum 4 KiB request body. Unexpected fields are rejected. No HTML, prompt, category ID, or source supplied by the client is trusted.

After an ambiguous response only, the browser may repeat the original description with one returned candidate ID:

~~~json
{
  "item": "battery",
  "selectedCategoryId": "standalone-rechargeable-batteries"
}
~~~

The server reruns the deterministic alias lookup and accepts the ID only when it is one of that result's one-to-four candidates. An invalid-format or unexpected field is rejected; a well-formed ID outside the original candidate set safely returns unsupported with no guidance. The ID is never a general client-controlled category lookup.

Normalization is Unicode NFKC, Unicode-dash replacement with ASCII `-`, whitespace collapse/trim, and `en-US` lowercase. Invalid type, empty/control-only, punctuation-only, embedded disallowed control/format character, or over-limit input stops before database access.

### Response union

~~~json
{
  "requestId": "opaque-id",
  "status": "success",
  "category": {"id": "canonical-slug", "name": "Display name"},
  "guidance": {
    "action": "Authored authoritative summary",
    "requirements": ["Authored requirement"],
    "where": "Optional authored destination or program"
  },
  "source": {
    "organization": "Official organization",
    "title": "Official page title",
    "url": "https://official.example/",
    "apparentUpdatedOn": "YYYY-MM-DD or null",
    "verifiedOn": "YYYY-MM-DD",
    "reviewBy": "YYYY-MM-DD"
  },
  "evidence": [{
    "id": "stable-evidence-id",
    "summary": "Bounded reviewed evidence summary",
    "locator": "Section, heading, or null",
    "claimScope": "Claims supported by this evidence",
    "reviewedOn": "YYYY-MM-DD"
  }],
  "trustMessage": "Disposal rules come from official sources."
}
~~~

Other statuses:

- ambiguous: question, one-to-four candidate {id,name} values, allowUnsure true, and the approved official fallback; no guidance/source.
- unsupported: reasonCode and approved fallback {title,url}; no guidance.
- error: reasonCode, retryable boolean, and user-safe message; no internal detail.

The category and evidence IDs are stable application data. The browser renders source/evidence text but does not infer claims. Unknown response properties do not control UI behavior. BL-007 validates every untrusted projection row, including official HTTPS domain, evidence fields, source verification/review dates, future dates, and consistency across rows, before returning success. Missing, stale, malformed, future-dated, or inconsistent evidence safely returns `EVIDENCE_UNAVAILABLE` without guidance. `apparentUpdatedOn` remains `null` when the official page exposes no reliable date; `reviewBy` is the freshness cutoff, not a claim that the government will update the page on that date.

### Status codes and errors

| HTTP | Meaning |
|---|---|
| 200 | success, ambiguous, or supported-domain unsupported result |
| 400 | malformed JSON or invalid item input |
| 413 | request body over limit |
| 429 | abuse/rate control |
| 500 | unexpected validated server failure |
| 503 | required database/provider temporarily unavailable |

Errors use bounded reason codes such as INVALID_INPUT, UNSUPPORTED, EVIDENCE_UNAVAILABLE, DATABASE_UNAVAILABLE, MODEL_UNAVAILABLE, RATE_LIMITED, and INTERNAL. Stack traces, SQL, secrets, provider payloads, and record internals never reach the client.

### Timing, retry, and idempotency

Target total time is 1.5 s p95 deterministic and 5 s p95 AI-assisted. BL-005 gives the database request a 1.2-second timeout and records a bounded local deterministic sample; representative deployed p95 remains a later release gate. The read-only request is naturally idempotent. BL-006 offers at most one user-initiated retry for a retryable network/503 result and never loops; do not automatically repeat model calls unless a separately tested policy justifies cost and safety. A random request ID supports diagnosis, not user tracking.

### Abuse

Enforce body/input limits and rate controls at the server/platform boundary. Avoid user fingerprinting. A 429 response contains a safe retry suggestion. Do not expose a bulk/list endpoint in V1.

## Supabase/PostgreSQL interface

The server queries only active reviewed records through parameterized library calls or prepared SQL. It must retrieve the complete category → guidance → evidence → source/freshness projection atomically enough that incomplete provenance cannot pass. Anonymous writes are denied. Database result schemas are validated before response assembly.

ADR-010 resolves the access mechanism: the server uses the Supabase Data API with a server-only publishable key acting as `anon` and queries the dedicated `api.disposal_lookup` security-invoker view. The native HTTP adapter sends the publishable key only in the `apikey` header and selects explicit columns under `Accept-Profile: api`; it has no service-role or write path. The `api` schema is the only application schema exposed to the Data API; base tables and verification history stay in `private`. Explicit grants and RLS allow approved/fresh reads and deny anonymous/authenticated writes.

## Optional model-provider interface

No provider is selected. If the evaluation gate passes, the server sends the normalized item plus a bounded list of allowed category IDs/names/aliases/descriptions. It requests a strict schema:

~~~json
{
  "decision": "matched | ambiguous | unsupported",
  "categoryId": "allowed-id-or-null",
  "candidateCategoryIds": ["allowed-id"],
  "reasonCode": "bounded-enum"
}
~~~

No disposal instructions are requested or accepted. The adapter applies a hard timeout, validates JSON/schema/allowlist and consistency, logs safe metadata, and converts any invalid/provider result into deterministic fallback or abstention. Provider retries are disabled by default.
