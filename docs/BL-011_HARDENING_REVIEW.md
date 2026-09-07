# BL-011 hardening review

## Scope and result

BL-011 closes the pre-deployment application hardening gates for FR-010 and NFR-004/007/008/009/010/011/012. GitHub Actions run `34162170691` passed Foundation and Docker-backed Database jobs, and PR #8 was squash-merged at `95e2744`. It adds no resident feature, category, disposal claim, AI path, external resource, or dependency. Production-only platform verification remains explicitly assigned to BL-013.

## Control evidence

| Control | Evidence | Result |
|---|---|---|
| Safe dependency failure | Existing failure injection plus diagnostic-logger failure test | No guidance; retryable generic response |
| Abuse handling | Application limiter and 429 test | Rejects before body/database; bounded response and retry time |
| Diagnostic logging/privacy | Structured event contract and synthetic incident drill | Minimum fields present; no raw input, address, secret, payload, or exception detail |
| Browser exposure | Security headers, committed-secret scan, production client-bundle scan | No server credential name/value in client assets |
| Database access | Existing migration/grant/RLS pgTAP and live Data API integration job | Intended read only; anonymous/authenticated writes denied |
| Performance | Existing 100-request unit sample and live Data API integration sample | Local deterministic p95 remains below 1.5 seconds; production p95 is BL-013 |
| Accessibility | Existing Playwright/axe/reflow suite and 2026-09-06 owner review | No automated serious/critical issue; keyboard, focus, 200% zoom, Narrator passed |
| CI isolation | Workflow and BL-009 gate tests | No paid model call or model credential in normal CI |

## Incident drill

The automated drill injects a database exception containing synthetic private detail while submitting a distinct synthetic raw item. Using only the returned request ID, the event identifies timestamp, version/environment, route, retrieve operation, database participation, deterministic classification path, total/dependency duration, database error class, and retry fallback. Neither private string appears in the response or event, and no instruction is returned. A logger exception is separately injected and cannot replace the safe response.

## Boundaries and remaining verification

- The in-process limiter is deliberately small and dependency-free. Serverless instances do not share its counters; BL-013 must configure and test distributed Vercel rate protection.
- Local latency is regression evidence, not representative production evidence. BL-013 owns deployed p95 measurement.
- The workstation cannot execute the Docker-backed Supabase suite; the required GitHub database job recreates and tests it.
- The current CSP permits framework-required inline script/style execution. React escaping and the prohibition on injected HTML remain controls; a nonce CSP can be revisited only if justified.
- Hosted log discovery, retention, alert thresholds, HTTPS, and environment separation require the real BL-013 resources.

## Rollback

Revert the BL-011 squash commit. This removes application throttling, structured events, response/security headers, client-bundle scanning, and their tests/docs without changing database schema, data, categories, or guidance.
