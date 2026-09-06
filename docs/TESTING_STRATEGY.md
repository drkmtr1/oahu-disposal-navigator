# Testing strategy

Testing grows with implemented behavior; Stage 1 created no test harness. BL-003 adds the first dependency-free foundation checks and GitHub CI. Each later layer exists only when it protects a real implemented boundary.

| Layer | Purpose | Representative coverage |
|---|---|---|
| Unit | Pure deterministic correctness | normalization, limits, alias matching, ambiguity, response assembly, freshness decisions |
| Contract/schema | Reject malformed boundaries | request/response union, database result shape, model output allowlist |
| Data/provenance | Protect authoritative records | required evidence, official URLs, approved status, review dates, category/source joins |
| Database | Protect schema/access | constraints, migrations/reset, SELECT allow rules, anonymous write denial, RLS/grants |
| Integration/API | Exercise server slice | lookup to canonical guidance, missing evidence, timeouts, error codes, no model on exact match |
| AI adapter | Contain untrusted output | mock matched/ambiguous/unsupported/malformed/extra prose/not-allowed IDs/timeouts |
| End to end | Validate resident behavior | submit, four states, clarification, correction/search again, source link, failure recovery |
| Accessibility/responsive | Enforce universal use | keyboard, focus, status, semantic labels, automated audit, 320/375/768/1280 widths, zoom |
| Security | Check trust boundary | secret/bundle scan, input/body limits, output encoding, abusive rate, log redaction |
| Regression evaluation | Measure safety/value | frozen deterministic and conditional live-model cases, provenance metrics |

## Fixtures

Use synthetic canonical records for most tests and a small versioned reviewed-source sample for provenance integration. A fixture includes category, aliases including one collision, guidance, source, evidence, verification state, and expiry cases. Freeze canonical IDs. Never use model-generated disposal guidance as fixture truth.

## Database strategy

Use the Supabase local stack only after its bounded setup task. Declarative schema and generated migrations must recreate the database from zero. Seed synthetic test data separately from approved reference seed data. Database tests assert grants and RLS for anon/authenticated SELECT/INSERT/UPDATE/DELETE and verify that stale/unreviewed/incomplete evidence cannot support a result. Do not point normal tests at production.

## Model strategy

Normal unit/integration/CI tests use a narrow adapter interface with deterministic mocks/recordings. Live paid calls are excluded from normal CI. A tagged, manual/release evaluation uses a pinned model/configuration and budget, records metadata, and never writes expected labels from outputs.

## CI expectations

As layers appear, a pull request must run formatting/lint, type checking, unit/contract tests, data validation, integration/database tests, production build, selected E2E accessibility/responsive flows, dependency/secret checks, and frozen non-paid regression evaluation. CI may use affected layers for speed only when the skipped scope is provably unrelated. Skips require a reason in the PR.

BL-003 currently gates reproducible install, lint, type checking, foundation smoke tests, both approved data validators, a dependency-free committed-secret scan, production build, and dependency audit. Database, API/integration, product E2E, automated accessibility/browser checks, and regression evaluation are absent because their implementing backlog items have not begun; they must be added to CI when those layers appear.

## Minimum passing build

- dependency install is reproducible from a committed lockfile;
- type, lint, unit, contract, and implemented integration checks pass;
- schema/migrations reset cleanly when database work exists;
- anonymous write-denial and provenance gates pass;
- production build succeeds;
- core E2E and automated accessibility checks have no blocking finding;
- deterministic regression meets NFR-003;
- no test is weakened, deleted, or marked flaky without a tracked root-cause item.

## Acceptance evidence

Tests reference requirement and AC IDs in names, metadata, or a maintained mapping. A passing test is necessary but does not replace manual UX/accessibility review, source review, live deployment verification, or comparative user evaluation.
