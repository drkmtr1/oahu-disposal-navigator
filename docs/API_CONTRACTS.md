# API contracts

V1 needs one same-origin application boundary, not a separately marketed public REST API. The route is an internal UI contract and may change through documented version control.

## POST /api/disposal-options

**Purpose:** validate an item description, classify it, retrieve approved canonical guidance/provenance, and return exactly one response state.

**Authentication/authorization:** none for residents. Server-side database access uses least-privilege read-only grants and RLS. Maintenance writes are outside this API.

### Request

~~~json
{
  "item": "old mattress"
}
~~~

Content-Type application/json; exactly one item string; 1–200 meaningful characters after normalization; bounded body size; unexpected fields ignored or rejected consistently. No HTML, prompt, category ID, or source supplied by the client is trusted.

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
    "verifiedOn": "YYYY-MM-DD"
  },
  "trustMessage": "Disposal rules come from official sources."
}
~~~

Other statuses:

- ambiguous: question, one-to-four candidate {id,name} values, and allowUnsure true; no guidance/source.
- unsupported: reasonCode and approved fallback {title,url}; no guidance.
- error: reasonCode, retryable boolean, and user-safe message; no internal detail.

The category ID is stable application data. The browser renders source text but does not infer claims. Unknown response properties do not control UI behavior.

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

Target total time is 1.5 s p95 deterministic and 5 s p95 AI-assisted. Set explicit database/provider timeouts within the total budget during implementation. The read-only request is naturally idempotent. Client automatic retry is limited to one transient network/503 retry and must not loop; do not automatically repeat model calls unless a separately tested policy justifies cost and safety. A request ID supports diagnosis, not user tracking.

### Abuse

Enforce body/input limits and rate controls at the server/platform boundary. Avoid user fingerprinting. A 429 response contains a safe retry suggestion. Do not expose a bulk/list endpoint in V1.

## Supabase/PostgreSQL interface

The server queries only active reviewed records through parameterized library calls or prepared SQL. It must retrieve the complete category → guidance → evidence → source/freshness projection atomically enough that incomplete provenance cannot pass. Anonymous writes are denied. Database result schemas are validated before response assembly.

The final access mechanism (Data API via publishable key versus a narrowly scoped server database role) is decided with the schema/access implementation; service-role access is explicitly not the default.

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
