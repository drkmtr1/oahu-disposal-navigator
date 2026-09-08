# BL-013 controlled production release record

## Status and boundary

**Status: in progress.** The controlled production lookup is live, but BL-013 is not complete and V1 is not release-audited. The remaining human-only gate is a destructive logical export/restore drill; it has not been run or authorized.

- Release owner and recovery owner: `drkmtr1`
- Recovery-time objective: 24 hours
- Production URL: <https://oahu-disposal-navigator.vercel.app/>
- Vercel project: `oahu-disposal-navigator` (`prj_HC9oQOHUfDeGIOTWdnhIK6oP3kP1`)
- Supabase project: `oahu-disposal-navigator` (`woxgdrygtpetfpullzlj`, `us-west-1`)
- Current tested artifact: `32e91eee4c3a0342aeb90fbe75f5ce8469392107` on `main`
- Current tested Vercel production deployment: `dpl_BY4CxJrsCW16HbvepExfBw5Q9dko`, READY on 2026-09-08

No service-role key, model key, or model integration is deployed. This remains a deterministic-only V1 under ADR-011.

## Controlled data release

The following reviewed migrations were applied to the hosted project in order:

1. `20260908044545_bl_004_reference_schema`
2. `20260908044602_lock_down_api_privileges`
3. `20260908044608_bl_004_reference_schema_append_only_trigger`
4. `20260908063946_bl_013_api_view_read_only`

`npm run db:verify-seed` confirmed that the generated seed matches the approved V1 data before it was applied. Hosted counts after load are 15 categories, 85 aliases, 15 guidance records, 3 official sources, 15 evidence records, 3 verification-history records, and 85 read-projection rows. The three approved source records are current as of the check: earliest review-by date 2026-10-05 and latest 2026-12-04.

The hosted Data API configuration was inspected directly: `api` is the single exposed schema and `api.disposal_lookup` is the single exposed object. All `private` tables are marked as schema-not-exposed. The hosted object-exposure control initially granted anonymous write privileges to the exposed view. The fourth migration explicitly revokes all browser-facing privileges and grants back only SELECT. Hosted verification confirms both `anon` and `authenticated` can SELECT but cannot INSERT, UPDATE, or DELETE the view; `private.source_verifications` remains unreadable to them.

## Environment and platform boundary

Vercel has exactly two project variables for this lookup, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`; both are server-only Secret variables scoped to Production. Preview has no production Supabase credential or data path. The unused `MODEL_PROVIDER`, `MODEL_API_KEY`, `MODEL_ID`, and `MODEL_REASONING_EFFORT` variables were removed under ADR-011.

Vercel Firewall has an active rule named `Rate limit disposal lookup`: request path equals `/api/disposal-options`, Fixed Window 60 seconds, 60 requests, keyed by IP address, with a 429 response. It adds no resident tracking.

## Production verification

The live browser → same-origin server → Supabase path was checked after credentials, Data API exposure, seed, and read-only grants were in place:

- `old mattress` returned the approved Mattresses guidance, City source link, bounded evidence control, and source verified/review-by/page-date metadata.
- `battery` returned only the bounded clarification choices, with no instruction before a choice.
- `toaster` returned the safe unsupported state and official City fallback, with no inferred disposal instruction.
- The initial misconfiguration produced a retryable generic 503; Vercel's structured event contained request ID, route, outcome, reason code, timing, validation/classification fields, and no raw resident input, secret, or database detail. The repaired configuration then returned a supported result.
- A read-only 20-request sequential production measurement for `old mattress` recorded p50 393.5 ms, p95 582.5 ms, and maximum 893.1 ms. This meets the deterministic 1.5-second p95 target in `AC-NFR-007-01`. AI latency is not applicable because AI is disabled.
- An HTTPS check returned 200 at the production URL and found HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers.

Local validation remains separate: this workstation cannot run a Docker-compatible local Supabase runtime. Docker-backed GitHub CI remains the repeatable live-local database test path. Local lint, typecheck, unit, data/seed, evaluation, build, bundle, secret-scan, and dependency-audit evidence is re-run for the release branch before any merge.

## Recovery and rollback

The Supabase dashboard shows a current physical backup and states that project databases are backed up daily around midnight in the project region and can be restored at any time. The dashboard also notes that Storage objects are excluded; V1 does not use Supabase Storage.

Application rollback uses Vercel's last verified READY deployment. Data/schema rollback uses a reviewed forward corrective migration or approved data correction; production reset is prohibited. The Vercel redeploy control was exercised while applying the repaired configuration. A rollback to a distinct earlier verified artifact is not claimed because no such production artifact exists yet.

The required tested logical export/restore path is intentionally **not** claimed. Performing it could restore a database or create a temporary restore project. It requires a separate owner decision covering target, cost, data handling, and cleanup. Until that drill is authorized and documented, BL-013 and the V1 release audit remain blocked.

## Known operational notes

- The current Vercel compute region is `iad1` while Supabase is `us-west-1`; the measured deterministic p95 currently passes, but this placement should be rechecked if latency regresses.
- Hosted Supabase advisors returned no high/critical finding. Existing informational notices include the intentionally policy-less, non-exposed append-only verification table, an unindexed foreign key, unused indexes before normal traffic, and an Auth connection configuration advisory. They are not silently remediated in BL-013.
- Owner review remains required for sustained 5xx/503, provider outage, rate-limit spikes, source-expiry blocks, latency breaches, and evaluation safety failures.

## Traceability

| Requirement | Criterion | Evidence in this record |
|---|---|---|
| NFR-007 | AC-NFR-007-01 | 20-sample deterministic p95 582.5 ms; safe retryable dependency failure; distributed rate protection. |
| NFR-008 | AC-NFR-008-01 | Production-only server variables, no model credentials, explicit Data API allowlist, hosted read-only role verification. |
| NFR-011 | AC-NFR-011-01 | Sanitized production failure event is diagnosable with minimum structured fields and no raw input or secret. |
| NFR-014 | AC-NFR-014-01 | GitHub `main` → Vercel production → same-origin server route → Supabase topology, HTTPS/headers, and Preview separation verified. |

The unfulfilled recovery drill prevents marking any of these release gates, BL-013, or BL-014 complete.
