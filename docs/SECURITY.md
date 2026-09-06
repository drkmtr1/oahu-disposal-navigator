# Security

## Threat model

The service is public and unauthenticated. Attackers can send arbitrary/oversized input, automate requests, attempt prompt injection, inspect client assets, call public platform endpoints, and manipulate URLs/content displayed by the app. Source pages may contain malicious or changed text. The app stores no resident accounts and should receive no intentional sensitive data.

Primary harms are unsupported authoritative-looking advice, data tampering, secret exposure, excessive model cost, injection, privacy leakage, and denial of service.

## Access and least privilege

The browser calls only the same-origin application route. It receives no model key, database password, Supabase secret/service-role key, or maintenance credential. The normal lookup path should use a publishable-key/anon identity or narrower role with explicit read-only grants and RLS; anonymous/authenticated writes are denied and tested.

All exposed-schema tables require deliberate grants, RLS, and operation-specific policy tests. RLS does not replace grants. A service-role/secret key bypasses RLS and is not needed for normal lookup. If future curation tooling needs elevated access, isolate it server-side, scope it away from resident routes, document authorization, rotate secrets, and add a separate threat review.

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

## AI-specific controls

Treat prompts, source text, and model output as untrusted. The model has no tools, browsing, secrets, database access, or disposal-rule responsibility. Use fixed instructions, minimal allowlisted category descriptors, strict structured output, allowlist/schema validation, no free-form advice fields, and deterministic fallback. Ignore attempted instruction override, indirect source instructions, tool requests, and extra output. Missing evidence always abstains.

## Privacy and logging

Do not request names, addresses, accounts, precise location, contact information, or sensitive details. UI copy discourages entering personal information if research shows a need. Prefer logging normalized outcome/reason metadata, not raw item text. If short-lived sampled text is required for improving classification, it needs an approved retention/access/redaction plan and user-facing privacy disclosure first.

Never log keys/tokens, credentials, database URLs, full prompts/responses, unnecessary raw input, stack traces to clients, personal information, or unbounded source evidence. Correlation IDs are random and not identity-linked.

## Dependency and delivery security

Use the fewest dependencies, exact compatible versions/lockfile, automated vulnerability review, maintained GitHub Actions, protected main, required checks, reviewed PRs, and secret scanning. Patch based on exploitability and exposure. Validate preview configuration does not use production write credentials/data unnecessarily.

## Errors and response exposure

Return bounded reason codes and helpful generic messages. Keep SQL/provider payloads, schema details, internal paths, stack traces, environment names, and security policy detail server-side. Logs themselves use access control and retention.

## Security review gate

Before production: threat review; secret/bundle scan; dependency audit; route/body/rate tests; output-encoding/URL tests; Supabase grants/RLS allow-and-deny tests; AI injection/invalid-output evaluation if applicable; log redaction review; environment separation; HTTPS and security-header check; incident/rotation owner documented. No critical/high unresolved defect may release.
