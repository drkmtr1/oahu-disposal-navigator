# Security

## Threat model

The service is public and unauthenticated. Attackers can send arbitrary/oversized input, automate requests, attempt prompt injection, inspect client assets, call public platform endpoints, and manipulate URLs/content displayed by the app. Source pages may contain malicious or changed text. The app stores no resident accounts and should receive no intentional sensitive data.

Primary harms are unsupported authoritative-looking advice, data tampering, secret exposure, excessive model cost, injection, privacy leakage, and denial of service.

## Access and least privilege

The browser calls only the same-origin application route. It receives no model key, database password, Supabase key, or maintenance credential. ADR-010 fixes the normal lookup identity as a server-only publishable key acting as `anon`. BL-005 sends it only through the server adapter's `apikey` header and never through `NEXT_PUBLIC_` configuration or response data. Only the dedicated `api.disposal_lookup` projection is exposed through the Data API; underlying curation tables remain in `private`. The security-invoker view preserves underlying RLS, explicit grants are SELECT-only, and anonymous/authenticated writes are denied and tested.

All exposed objects and supporting tables require deliberate grants, RLS where applicable, and operation-specific policy tests. RLS does not replace grants. Verification history has no `anon`/`authenticated` SELECT grant and is append-only. A service-role/secret key bypasses RLS and is not needed for normal lookup. If future curation tooling needs elevated access, isolate it server-side, scope it away from resident routes, document authorization, rotate secrets, and add a separate threat review. BL-013 must configure the hosted Data API to expose `api` only and repeat the allow/deny tests against that environment.

Current official references for later implementation:

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys

## Secrets and environments

Keep local secrets in ignored environment files; commit only a placeholder describing names/purpose. Scope Vercel variables separately to Preview and Production. Never put secrets in NEXT_PUBLIC-prefixed variables, source, PR text, screenshots, logs, tests, fixtures, error responses, or model prompts. Rotate on suspected exposure and document owner/recovery without copying values.

## Input, output, and abuse controls

- Enforce JSON/body and 1–200 meaningful-character limits on server.
- Normalize deterministically; reject invalid types/control-only content.
- Parameterize database access and validate every external result schema.
- Let framework escaping render text; do not inject HTML.
- Permit only reviewed HTTPS official-source URLs in result links.
- Apply server/platform rate controls and bounded timeouts; return 429 safely.
- Limit retry, category candidates, database rows, and model tokens.
- Do not create bulk enumeration or write APIs in V1.

BL-011 adds a dependency-free application-layer fixed-window limit of 60 requests per minute per ephemeral, process-salted client-address digest. The digest is never logged or returned, state is capped at 1,000 entries, and excess requests return a generic `429` plus `Retry-After` before parsing or database access. This is defense in depth, not a distributed quota: BL-013 must configure and verify Vercel platform rate protection for multi-instance production traffic without adding resident tracking.

## AI-specific controls

Treat prompts, source text, and model output as untrusted. The model has no tools, browsing, secrets, database access, or disposal-rule responsibility. Use fixed instructions, minimal allowlisted category descriptors, strict structured output, allowlist/schema validation, no free-form advice fields, and deterministic fallback. Ignore attempted instruction override, indirect source instructions, tool requests, and extra output. Missing evidence always abstains.

## Privacy and logging

Do not request names, addresses, accounts, precise location, contact information, or sensitive details. UI copy discourages entering personal information if research shows a need. Prefer logging normalized outcome/reason metadata, not raw item text. If short-lived sampled text is required for improving classification, it needs an approved retention/access/redaction plan and user-facing privacy disclosure first.

Never log keys/tokens, credentials, database URLs, full prompts/responses, unnecessary raw input, stack traces to clients, personal information, or unbounded source evidence. Correlation IDs are random and not identity-linked.

## Dependency and delivery security

Use the fewest dependencies, exact compatible versions/lockfile, automated vulnerability review, maintained GitHub Actions, protected main, required checks, reviewed PRs, and secret scanning. Patch based on exploitability and exposure. Validate preview configuration does not use production write credentials/data unnecessarily.

## Errors and response exposure

Return bounded reason codes and helpful generic messages. Keep SQL/provider payloads, schema details, internal paths, stack traces, environment names, and security policy detail server-side. Logs themselves use access control and retention.

BL-011 applies CSP, referrer, MIME-sniffing, framing, and browser-feature headers to all paths and removes the framework identity header. The CSP permits framework-required inline scripts/styles in this Next.js version; reviewed React rendering and the prohibition on injected HTML remain necessary controls. A future nonce-based CSP is a defense-in-depth improvement, not a V1 architecture change.

## Security review gate

Before production: threat review; secret/bundle scan; dependency audit; route/body/rate tests; output-encoding/URL tests; Supabase grants/RLS allow-and-deny tests; AI injection/invalid-output evaluation if applicable; log redaction review; environment separation; HTTPS and security-header check; incident/rotation owner documented. No critical/high unresolved defect may release.
