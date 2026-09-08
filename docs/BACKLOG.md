# Prioritized backlog

Status values: Ready, In review, Blocked by dependency, Complete, Conditional, Future. Complexity is relative S/M/L for one developer.

## Requirement traceability

This matrix supplies the planning chain from requirement to criterion, owning implementation backlog, verification, and the shared completion gate in DEFINITION_OF_DONE. Implementation evidence is intentionally pending after Stage 1.

| Requirement | Acceptance criteria | Owning backlog | Planned verification |
|---|---|---|---|
| FR-001 | AC-FR-001-01 | BL-003, BL-005, BL-006 | E2E/usability |
| FR-002 | AC-FR-002-01, AC-FR-002-02 | BL-005 | Unit/API/E2E |
| FR-003 | AC-FR-003-01, AC-FR-003-02 | BL-002, BL-005, BL-008 | Unit/integration/evaluation |
| FR-004 | AC-FR-004-01, AC-FR-004-02 | BL-009, conditional BL-010 | Adapter/live evaluation |
| FR-005 | AC-FR-005-01 | BL-002, BL-004, BL-005, BL-007 | Data/integration/provenance |
| FR-006 | AC-FR-006-01 | BL-006, BL-012 | Component/E2E/resident-task benchmark |
| FR-007 | AC-FR-007-01 | BL-001, BL-002, BL-004, BL-007 | Data audit/E2E |
| FR-008 | AC-FR-008-01, AC-FR-008-02 | BL-006, BL-012, conditional BL-010 | Unit/E2E/resident-task benchmark |
| FR-009 | AC-FR-009-01 | BL-005, BL-006, conditional BL-010 | Safety/E2E |
| FR-010 | AC-FR-010-01 | BL-005, BL-011 | Failure injection |
| FR-011 | AC-FR-011-01 | BL-006 | E2E/usability |
| FR-012 | AC-FR-012-01 | BL-006 | Content/E2E |
| FR-013 | AC-FR-013-01 | BL-001, BL-002, BL-004, BL-007 | Data/integration |
| NFR-001 | AC-NFR-001-01 | BL-001, BL-002, BL-014 | Scope/release audit |
| NFR-002 | AC-NFR-002-01 | BL-001, BL-002, BL-007, BL-008 | Provenance audit |
| NFR-003 | AC-NFR-003-01 | BL-002, BL-007–BL-010, BL-014 | Regression evaluation |
| NFR-004 | AC-NFR-004-01, AC-NFR-004-02, AC-NFR-004-03 | BL-003, BL-006, BL-011, BL-012 | Accessibility checks |
| NFR-005 | AC-NFR-005-01, AC-NFR-005-02 | BL-006, BL-012 | UI review/resident-task benchmark |
| NFR-006 | AC-NFR-006-01 | BL-003, BL-006, BL-012 | Responsive E2E |
| NFR-007 | AC-NFR-007-01 | BL-005, BL-009, BL-011, BL-013 | Performance metrics |
| NFR-008 | AC-NFR-008-01 | BL-003, BL-004, BL-011, BL-013 | Secret/database tests |
| NFR-009 | AC-NFR-009-01 | BL-006, BL-011 | Privacy/log audit |
| NFR-010 | AC-NFR-010-01 | BL-005, BL-009–BL-011 | Failure injection |
| NFR-011 | AC-NFR-011-01 | BL-011, BL-013 | Log test/incident drill |
| NFR-012 | AC-NFR-012-01 | BL-003–BL-011 | CI/evaluation evidence |
| NFR-013 | AC-NFR-013-01 | Every implementation BL; audited in BL-014 | PR/release audit |
| NFR-014 | AC-NFR-014-01 | BL-003, BL-004, BL-013 | Architecture/deployment review |

AC-V1-01 belongs to BL-012 and BL-014; AC-V1-02 belongs to BL-014. Every row must pass the backlog-item and V1 gates in DEFINITION_OF_DONE.

## BL-001 — Pilot authoritative source inventory

- Status/Priority/Complexity: Complete; merged to `main` at `db5472b` / P0 / M
- Description: Define the source inventory format and capture reviewed evidence for exactly five diverse candidate categories from primary City/County sources (State/other primary government only with written necessity). Candidates are research subjects, not V1 promises.
- Requirements: FR-005, FR-007, FR-013, NFR-001, NFR-002, NFR-003
- Acceptance criteria: AC-FR-007-01, AC-FR-013-01, AC-NFR-002-01; item checks require organization/title/official URL/access date/apparent update date/evidence/locator/claim scope/category/restrictions/gaps/review state and an authority/inclusion rubric.
- Dependencies: Satisfied by approved and pushed Stage 1 foundation commit `aa3a296`
- Testing: parse/structure validation for machine-readable inventory; duplicate/stable ID and required-field checks; official-domain/HTTPS check; manual evidence-to-claim and live-link review.
- Evidence: `docs/SOURCE_INVENTORY.md`, `data/source-inventory.json`, and `scripts/validate-source-inventory.mjs`; five live primary-government source relationships checked on 2026-09-05; validator passed and the work was merged at `db5472b`.

## BL-002 — Freeze V1 categories and reviewed canonical dataset

- Status/Priority/Complexity: Complete; 15 reviewed categories approved after project-owner audit and live-source second pass / P0 / L
- Description: Extend discovery, select 15–25 categories, exclude insufficient/conflicting cases, and author canonical aliases/guidance/provenance/freshness records.
- Requirements: FR-003, FR-005, FR-007, FR-013, NFR-001, NFR-002, NFR-003
- Acceptance criteria: AC-NFR-001-01, AC-NFR-002-01, AC-FR-005-01, AC-FR-007-01, AC-FR-013-01
- Dependencies: BL-001
- Testing: dataset schema/uniqueness, ambiguity collisions, required evidence, official URLs, freshness state, independent manual audit.
- Evidence: `docs/V1_CATEGORY_DATASET.md`, `data/v1-canonical-dataset.json`, and `scripts/validate-v1-dataset.mjs`; project-owner review and a live-source second pass completed on 2026-09-05 with reviewer reference `project-owner-human-review`. Validation passes with 15 active approved categories, 85 approved aliases, three approved City sources, 15 approved evidence records, one intentional ambiguity, qualification checks for eligibility-sensitive aliases, and source review-by dates of 2026-10-05 or 2026-12-04 according to cadence.
- Completion: All BL-002 source, scope, provenance, alias-safety, approval, and freshness gates pass. Runtime enforcement and regression behavior remain assigned to their later mapped backlog items.

## BL-003 — Reproducible application and CI foundation

- Status/Priority/Complexity: Complete; merged to `main` at `137b432` / P0 / M
- Description: Scaffold the minimal pinned Next.js/TypeScript app, scripts, environment example, and GitHub CI without product functionality.
- Requirements: FR-001, NFR-004, NFR-006, NFR-008, NFR-012, NFR-013, NFR-014
- Acceptance criteria: AC-NFR-012-01, AC-NFR-013-01; reproducible install/type/lint/test/build and no secret/client credential
- Dependencies: BL-001 informs data/tooling shape
- Testing: smoke unit, build, CI, secret scan; no UI/product implementation.
- Evidence: pinned `package.json`/`package-lock.json` and Node/npm versions; minimal App Router shell; names-only `.env.example`; dependency-free foundation tests and secret scan; GitHub CI gates install, lint, type, test, both reviewed-data validators, secret scan, production build, and dependency audit. The ESLint 9 pin is the current compatible path for Next.js 16.3.4's bundled React lint plugin and should be revisited when that upstream configuration supports ESLint 10.
- Completion: Human review and merge are complete at `137b432`; no product functionality or external resource was created.

## BL-004 — Supabase relational schema and access controls

- Status/Priority/Complexity: Complete; merged to `main` at `fb160b5` / P0 / L
- Description: Implement reviewed declarative data model, generated migration, reference/test seeds, read projection, explicit grants/RLS, and policy tests.
- Requirements: FR-005, FR-007, FR-013, NFR-002, NFR-008, NFR-012, NFR-014
- Acceptance criteria: AC-FR-005-01, AC-FR-007-01, AC-FR-013-01, AC-NFR-008-01
- Dependencies: BL-002 and BL-003 complete; OD-002 and OD-003 resolved
- Testing: local reset/migration, constraints, provenance joins, active/fresh filter, anon/auth allow-and-deny operations.
- Evidence: Declarative schema under `supabase/schemas`, generated and privilege-hardening migrations under `supabase/migrations`, deterministic reviewed seed generation, the `api.disposal_lookup` projection, passing pgTAP database/access checks, and passing GitHub foundation/database jobs. No hosted Supabase project was created or linked.
- Completion: Human review and squash merge are complete at `fb160b5`.

## BL-005 — Deterministic lookup vertical slice

- Status/Priority/Complexity: Complete; squash-merged to `main` at `c33c25d` / P0 / L
- Description: Implement input/route/normalization/alias lookup/response union for a small reviewed slice, including ambiguity, unsupported, missing evidence, and dependency failure.
- Requirements: FR-001, FR-002, FR-003, FR-005, FR-009, FR-010, NFR-007, NFR-010, NFR-012
- Acceptance criteria: all ACs for listed FRs; AC-NFR-010-01
- Dependencies: BL-004
- Testing: unit/contract/API/integration, zero-model-call assertion, failure injection, latency sample.
- Evidence: The server-only deterministic modules and `POST /api/disposal-options` route validate a strict 4 KiB JSON body and 1–200-character item, normalize exactly as the approved alias dataset specifies, query `api.disposal_lookup` with a publishable-key `apikey` header, validate every untrusted row/provenance field, and return only the documented success/ambiguity/unsupported/error shapes. Node tests cover exact match with no model path, the three-way `battery` ambiguity, unmatched input, malformed/stale/inconsistent evidence, dependency failure, response sanitization, configuration safety, and a bounded local latency sample. GitHub CI run `34059926827` rebuilt the local Supabase stack and passed five live Data API integration cases plus the foundation and database gates. No hosted resource or resident UI was added.
- Completion: Human review and squash merge are complete at `c33c25d`. Production latency evidence remains assigned to BL-013.

## BL-006 — Four-state accessible resident UX

- Status/Priority/Complexity: Complete on `main` at `9853528`; implementation, automated checks, CI, and the bounded manual accessibility review pass / P0 / L
- Description: Implement initial, structured success, ambiguity clarification, unsupported/error, edit/search-again, and trust copy.
- Requirements: FR-001, FR-006, FR-008, FR-009, FR-011, FR-012, NFR-004, NFR-005, NFR-006, NFR-009
- Acceptance criteria: corresponding functional ACs and all AC-NFR-004/005/006/009 criteria
- Dependencies: BL-005
- Testing: component/E2E, keyboard/focus/status, automated accessibility, target sizes, responsive widths, zoom/manual screen reader.
- Evidence: `app/disposal-navigator.tsx`, `app/page.tsx`, and `app/globals.css` implement one labeled item form plus initial, loading, structured success, bounded ambiguity, unsupported/evidence-unavailable, and retryable error behavior. A clarification choice is accepted only when the server confirms it belongs to the original deterministic match; “I’m not sure” shows no instruction and uses the approved fallback. Pinned Playwright/axe checks exercise keyboard entry and validation, focus and status behavior, semantic result sections, source/trust copy, edit/search-again, clarification selection/abstention, unsupported/error recovery, 44-pixel controls, empty browser storage, no serious/critical accessibility finding, and no page overflow at 320/375/768/1280 pixels or the 200%-zoom-equivalent width. Local production build and browser checks pass with no framework overlay or console error. GitHub CI run `34064497378` passed the Foundation and Database jobs for PR #4. The [manual review record](BL-006_ACCESSIBILITY_REVIEW.md) preserves the project owner's 2026-09-06 report that 200% zoom, keyboard/focus operation, and Windows Narrator worked without a blocking accessibility issue. The local live-data path was not exercised because the review workstation lacks the Docker-compatible runtime required by local Supabase; automated fixture-based browser checks cover all resident states, and later real browser → server → Supabase verification remains assigned to BL-013.
- Completion: BL-006 implementation, automated evidence, CI, its bounded manual accessibility evidence pass, and squash merge are complete. AC-NFR-005-02 resident-task benchmark evidence remains owned by BL-012 and is not claimed here.

## BL-007 — Complete provenance and freshness behavior

- Status/Priority/Complexity: Complete; squash-merged to `main` at `745dece` / P0 / M
- Description: Load the frozen reviewed dataset, expose source/evidence/freshness correctly, and implement manual review/update runbook behavior.
- Requirements: FR-005, FR-007, FR-013, NFR-002, NFR-003
- Acceptance criteria: AC-FR-005-01, AC-FR-007-01, AC-FR-013-01, AC-NFR-002-01, AC-NFR-003-01
- Dependencies: BL-002, BL-004, BL-006
- Testing: full data/provenance regression, stale/conflict/unavailable exclusion, visible source E2E.
- Evidence: `lib/disposal/domain.ts`, `lib/disposal/supabase.ts`, and `app/disposal-navigator.tsx` carry stored evidence plus apparent-update, verification, and review-by dates through the complete lookup path. `data/v1-canonical-dataset.json` schema 1.1 stores explicit append-only verification history, enforced by its validator and generated seed. `tests/provenance.test.mjs`, the local Data API integration suite, database policy tests, and resident E2E cover all 85 category-alias mappings, citation/claim equality, 10 critical exclusions, ineligible freshness/review states, and visible provenance. [The BL-007 review](BL-007_PROVENANCE_REVIEW.md) records the bounded audit; [the source review runbook](SOURCE_REVIEW_RUNBOOK.md) defines future manual updates. Local validation passes. GitHub Actions run `34081999555` passed both Foundation and Docker-backed Database jobs for PR #5, including database reset/lint/pgTAP, live local Data API integration, and declarative-schema drift checks.
- Completion: BL-007 implementation, documentation, local validation, source comparison, CI evidence, approval, and squash merge are complete. BL-008's independently reviewed frozen baseline evaluation is not claimed here.

## BL-008 — Deterministic baseline evaluation

- Status/Priority/Complexity: Complete; human-reviewed and squash-merged to `main` at `23ef468` / P0 / M
- Description: Build frozen development/holdout sets and report deterministic classification, abstention, claim, citation, and latency metrics.
- Requirements: FR-003, FR-005, FR-009, NFR-002, NFR-003, NFR-012
- Acceptance criteria: AC-FR-003-01/02, AC-FR-005-01, AC-FR-009-01, AC-NFR-003-01
- Dependencies: BL-005, BL-007
- Testing: reproducible evaluation runner, label review, repeatability check.
- Evidence: The versioned 155-case development/holdout set, dependency-free generator/validator/runner, repeatability tests, safety gates, and measured limitations are documented in [BL-008_DETERMINISTIC_BASELINE.md](BL-008_DETERMINISTIC_BASELINE.md). Automated checks and GitHub CI passed; the project owner completed the independent label/PR review and squash-merged PR #6 at `23ef468`.

## BL-009 — AI value/need experiment and ADR

- Status/Priority/Complexity: Complete; mandatory AI gate failed and deterministic-only decision approved; squash-merged to `main` at `75b8d0e` / P1 / M
- Description: Compare bounded provider candidates to baseline on frozen hard/holdout cases; decide implement or deterministic-only.
- Requirements: FR-004, NFR-003, NFR-007, NFR-010, NFR-012
- Acceptance criteria: AC-FR-004-01/02 and every AI gate in EVALUATION_PLAN
- Dependencies: BL-008 and explicit live-call budget/credential
- Testing: repeated live evaluation, structured validity, containment, latency/token/cost report.
- Evidence: [BL-009_AI_VALUE_EXPERIMENT.md](BL-009_AI_VALUE_EXPERIMENT.md) records three runs and 180 calls of GPT-5.6 Luna for an estimated $0.044361. Accuracy, structure, latency, cost, containment, and no-guidance gates passed, but repeatable false matches on two critical inputs produced only 92.86% critical safe handling. Accepted ADR-011 therefore selects deterministic-only V1. Local validation and GitHub Actions run `34158975816` passed; human approval and squash merge completed at `75b8d0e`.

## BL-010 — Conditional bounded AI adapter

- Status/Priority/Complexity: Closed as not justified by BL-009 candidate; final on ADR-011 approval/merge / P1 / M
- Description: If and only if ADR approves, implement the server-only structured allowlist classifier and deterministic fallback. Otherwise close as not justified.
- Requirements: FR-004, FR-008, FR-009, FR-010, NFR-003, NFR-010, NFR-012
- Acceptance criteria: AC-FR-004-02, AC-FR-008-01/02, AC-FR-009-01, AC-FR-010-01, AC-NFR-003-01
- Dependencies: BL-009 pass
- Testing: adapter mocks, injection/invalid IDs/extra advice/timeouts, live release regression.

## BL-011 — Security, reliability, accessibility, and observability hardening

- Status/Priority/Complexity: Complete; squash-merged to `main` at `95e2744` / P0 / L
- Description: Close platform/access, error, rate, logging, privacy, performance, accessibility, and incident-diagnostic gates.
- Requirements: FR-010, NFR-004, NFR-007, NFR-008, NFR-009, NFR-010, NFR-011, NFR-012
- Acceptance criteria: all corresponding NFR ACs
- Dependencies: BL-006/007 and BL-010 if used
- Testing: threat controls, secret/bundle scan, policy tests, failure injection, logs, performance, accessibility manual/automated.
- Evidence: [BL-011 hardening review](BL-011_HARDENING_REVIEW.md), dependency-free application rate control, bounded structured diagnostic events, response/security headers, post-build client-bundle scan, and focused failure/privacy/rate/header tests. Existing database policy/integration, deterministic safety/latency, Playwright/axe/reflow, and the completed owner accessibility review remain applicable. GitHub Actions run `34162170691` passed both Foundation and Docker-backed Database jobs; PR #8 was squash-merged at `95e2744`. Distributed platform rate control, hosted-log drill, and representative production p95 are verified in BL-013 rather than claimed locally.

## BL-012 — Reproducible resident-task validation

- Status/Priority/Complexity: Complete; squash-merged to `main` at `6fbf275` / P0 / M
- Description: Run the approved frozen non-participant resident-task benchmark, report limitations/failures, and create a bounded corrective item only if a gate fails.
- Requirements: FR-001, FR-006, FR-008, FR-009, FR-011, NFR-004, NFR-005, NFR-006, NFR-012
- Acceptance criteria: AC-NFR-005-02 and AC-V1-01
- Dependencies: BL-011
- Testing: fixture validation, raw/aggregate metric verification, repeatability, safety/source-association gates, and claim-boundary review.
- Evidence: [BL-012 resident-task evaluation](BL-012_RESIDENT_TASK_EVALUATION.md), frozen 20-case fixture, dependency-free validator/runner, focused repeatability and claim-boundary tests, and GitHub Actions run `34165136596`. Foundation and Docker-backed Database checks passed before PR #10 was squash-merged.

## BL-013 — Controlled Supabase and Vercel production release

- Status/Priority/Complexity: Complete / P0 / L
- Description: Create authorized external resources, apply approved schema/data, configure environment secrets, connect GitHub/Vercel, deploy, smoke test, and record rollback/operations evidence.
- Requirements: NFR-007, NFR-008, NFR-011, NFR-014
- Acceptance criteria: AC-NFR-007-01, AC-NFR-008-01, AC-NFR-011-01, AC-NFR-014-01
- Dependencies: BL-011, BL-012 and credentials/owner approval
- Testing: migration/access, full production E2E, HTTPS/security, log diagnosis, and documented backup/recovery and rollback controls.
- Evidence: [BL-013 production release record](BL-013_PRODUCTION_RELEASE.md) records the 2026-09-08 hosted migration/seed load, live browser states, HTTPS/headers, 20-sample p95 of 582.5 ms, sanitized log diagnosis, Vercel IP rate rule, documented daily backup availability/recovery owner and objective, and read-only Data API access verification. The initial Data API object-exposure configuration reintroduced anonymous write grants on the exposed view; reviewed migration `20260908063946_bl_013_api_view_read_only` corrected this and hosted verification now shows SELECT-only access. The project owner removed the destructive logical export/restore drill from V1 release requirements on 2026-09-08; no such drill is claimed as evidence.

## BL-014 — V1 release audit and tag

- Status/Priority/Complexity: In progress / P0 / M
- Description: Audit every requirement/AC, source freshness, risk, known limitation, documentation, production behavior, and V1 DoD; tag only if all gates pass.
- Requirements: all FR-001–FR-013 and NFR-001–NFR-014
- Acceptance criteria: all functional/nonfunctional ACs, AC-V1-01, AC-V1-02
- Dependencies: BL-001–BL-013 as applicable
- Testing: traceability audit, full CI/evaluation evidence, production smoke recheck.
