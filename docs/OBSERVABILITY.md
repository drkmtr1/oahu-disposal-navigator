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

## Forbidden data

Never log secrets, API keys, passwords, database URLs with credentials, authorization tokens, service-role keys, full provider requests/responses, unnecessary raw item text, names/addresses/precise location, sensitive material descriptions, complete evidence passages, client stack traces, or arbitrary headers. Default to no raw input retention.

## Alerts and review

Stage 1 defines no paging vendor. Before release, set practical owner-reviewed signals for sustained 5xx/503, database/provider outage, rate-control spikes, source-expiry blocks, latency breach, cost anomaly, and any unsupported-claim/citation evaluation failure. Evaluation safety failures block release immediately.

## Incident drill

Given a request ID from a generic error, the maintainer should locate the deployment/commit, operation, safe error class, dependency participation, duration, data version, and fallback outcome, then reproduce with a synthetic input. If this cannot be done without raw resident data, observability is insufficiently designed.
