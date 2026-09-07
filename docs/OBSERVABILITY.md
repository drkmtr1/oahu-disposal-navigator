# Observability

V1 uses Vercel request/deployment logs, Supabase platform/database logs, structured server events, and evaluation reports. No additional vendor is justified in Stage 1.

## Minimum diagnostic event

A failed resident request must be diagnosable with:

- UTC timestamp;
- random request/correlation ID;
- application version/commit and environment;
- route and operation (validate, classify, retrieve, assemble);
- outcome and bounded reason/error class;
- whether database and model were attempted, without credentials/payloads;
- total and dependency durations;
- validation result and classification path (deterministic/AI/fallback);
- category ID only when safely resolved;
- source-data version/review outcome when relevant;
- provider/model identifier and token/cost counts only if AI ran.

This evidence answers when/where the failure occurred, which dependency participated, whether validation/freshness failed, how long it took, and which safe fallback was used.

## Event vocabulary

Use structured events such as lookup_completed, lookup_ambiguous, lookup_unsupported, lookup_failed, database_failed, model_failed, model_output_rejected, evidence_rejected, and rate_limited. Fields have bounded enums; error objects are sanitized. Success and failure rates, latency percentiles, validation rejects, fallback frequency, source-expiry blocks, provider error rate, token use, and estimated cost form the minimum operational metrics.

## Platform use

- **Vercel:** deployment/build state, route failures, runtime logs, latency, environment/commit.
- **Supabase:** connection/query failures, platform incidents, slow/error signals, access-policy failures.
- **Application:** correlation across classification, retrieval, validation, and response.
- **Evaluation:** versioned correctness/safety/UX results, not live-user telemetry.

Never imply that an open port, successful build, or healthy deployment proves the resident flow or data correctness.

BL-011 implements one JSON event per lookup response in `lib/disposal/operations.ts`. The event contract uses bounded names/enums and includes the minimum fields above. It records no item text, IP address/digest, arbitrary header, database/provider payload, evidence passage, or exception message. `X-Request-Id` mirrors the random response identifier so a resident can report a safe reference. Logging failure is contained and cannot alter the safe response.

For this deterministic-only V1, `modelAttempted` is always false. `sourceDataVersion` is the reviewed source verification date for a successful result; it is null otherwise. The application version uses the validated Vercel Git commit SHA when present, and environment uses a bounded Vercel/Node value. Unknown metadata is explicitly `unknown`, never guessed.

## Forbidden data

Never log secrets, API keys, passwords, database URLs with credentials, authorization tokens, service-role keys, full provider requests/responses, unnecessary raw item text, names/addresses/precise location, sensitive material descriptions, complete evidence passages, client stack traces, or arbitrary headers. Default to no raw input retention.

## Alerts and review

Stage 1 defines no paging vendor. Before release, set practical owner-reviewed signals for sustained 5xx/503, database/provider outage, rate-control spikes, source-expiry blocks, latency breach, cost anomaly, and any unsupported-claim/citation evaluation failure. Evaluation safety failures block release immediately.

## Incident drill

Given a request ID from a generic error, the maintainer should locate the deployment/commit, operation, safe error class, dependency participation, duration, data version, and fallback outcome, then reproduce with a synthetic input. If this cannot be done without raw resident data, observability is insufficiently designed.

BL-011's synthetic database-failure drill verifies that a single `lookup_failed` event identifies the request, route, retrieve operation, database participation, duration, deterministic path, database error class, and retry fallback while the response contains no guidance. The test also proves neither the synthetic raw item nor the thrown dependency detail appears in the event or response. Hosted log search and retention remain BL-013 production verification.
