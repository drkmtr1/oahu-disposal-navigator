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
| FR-006 | AC-FR-006-01 | BL-006 | Component/E2E/user test |
| FR-007 | AC-FR-007-01 | BL-001, BL-002, BL-004, BL-007 | Data audit/E2E |
| FR-008 | AC-FR-008-01, AC-FR-008-02 | BL-006, conditional BL-010 | Unit/E2E/user test |
| FR-009 | AC-FR-009-01 | BL-005, BL-006, conditional BL-010 | Safety/E2E |
| FR-010 | AC-FR-010-01 | BL-005, BL-011 | Failure injection |
| FR-011 | AC-FR-011-01 | BL-006 | E2E/usability |
| FR-012 | AC-FR-012-01 | BL-006 | Content/E2E |
| FR-013 | AC-FR-013-01 | BL-001, BL-002, BL-004, BL-007 | Data/integration |
| NFR-001 | AC-NFR-001-01 | BL-001, BL-002, BL-014 | Scope/release audit |
| NFR-002 | AC-NFR-002-01 | BL-001, BL-002, BL-007, BL-008 | Provenance audit |
| NFR-003 | AC-NFR-003-01 | BL-002, BL-007–BL-010, BL-014 | Regression evaluation |
| NFR-004 | AC-NFR-004-01, AC-NFR-004-02, AC-NFR-004-03 | BL-003, BL-006, BL-011, BL-012 | Accessibility checks |
| NFR-005 | AC-NFR-005-01, AC-NFR-005-02 | BL-006, BL-012 | UI review/user test |
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

- Status/Priority/Complexity: In review; local checks pass / P0 / L
- Description: Implement input/route/normalization/alias lookup/response union for a small reviewed slice, including ambiguity, unsupported, missing evidence, and dependency failure.
- Requirements: FR-001, FR-002, FR-003, FR-005, FR-009, FR-010, NFR-007, NFR-010, NFR-012
- Acceptance criteria: all ACs for listed FRs; AC-NFR-010-01
- Dependencies: BL-004
- Testing: unit/contract/API/integration, zero-model-call assertion, failure injection, latency sample.
- Evidence: The server-only deterministic modules and `POST /api/disposal-options` route validate a strict 4 KiB JSON body and 1–200-character item, normalize exactly as the approved alias dataset specifies, query `api.disposal_lookup` with a publishable-key `apikey` header, validate every untrusted row/provenance field, and return only the documented success/ambiguity/unsupported/error shapes. Node tests cover exact match with no model path, the three-way `battery` ambiguity, unmatched input, malformed/stale/inconsistent evidence, dependency failure, response sanitization, configuration safety, and a bounded local latency sample. No hosted resource or resident UI was added.
- Completion: Implementation and local acceptance evidence are complete on the BL-005 feature branch. Production latency evidence remains assigned to BL-013; the item remains In review until CI and human PR approval/merge.

## BL-006 — Four-state accessible resident UX

- Status/Priority/Complexity: Blocked by BL-005 / P0 / L
- Description: Implement initial, structured success, ambiguity clarification, unsupported/error, edit/search-again, and trust copy.
- Requirements: FR-001, FR-006, FR-008, FR-009, FR-011, FR-012, NFR-004, NFR-005, NFR-006, NFR-009
- Acceptance criteria: corresponding functional ACs and all AC-NFR-004/005/006/009 criteria
- Dependencies: BL-005
- Testing: component/E2E, keyboard/focus/status, automated accessibility, target sizes, responsive widths, zoom/manual screen reader.

## BL-007 — Complete provenance and freshness behavior

- Status/Priority/Complexity: Blocked by BL-002/004/006 / P0 / M
- Description: Load the frozen reviewed dataset, expose source/evidence/freshness correctly, and implement manual review/update runbook behavior.
- Requirements: FR-005, FR-007, FR-013, NFR-002, NFR-003
- Acceptance criteria: AC-FR-005-01, AC-FR-007-01, AC-FR-013-01, AC-NFR-002-01, AC-NFR-003-01
- Dependencies: BL-002, BL-004, BL-006
- Testing: full data/provenance regression, stale/conflict/unavailable exclusion, visible source E2E.

## BL-008 — Deterministic baseline evaluation

- Status/Priority/Complexity: Blocked by BL-005/007 / P0 / M
- Description: Build frozen development/holdout sets and report deterministic classification, abstention, claim, citation, and latency metrics.
- Requirements: FR-003, FR-005, FR-009, NFR-002, NFR-003, NFR-012
- Acceptance criteria: AC-FR-003-01/02, AC-FR-005-01, AC-FR-009-01, AC-NFR-003-01
- Dependencies: BL-005, BL-007
- Testing: reproducible evaluation runner, label review, repeatability check.

## BL-009 — AI value/need experiment and ADR

- Status/Priority/Complexity: Blocked by BL-008 / P1 / M
- Description: Compare bounded provider candidates to baseline on frozen hard/holdout cases; decide implement or deterministic-only.
- Requirements: FR-004, NFR-003, NFR-007, NFR-010, NFR-012
- Acceptance criteria: AC-FR-004-01/02 and every AI gate in EVALUATION_PLAN
- Dependencies: BL-008 and explicit live-call budget/credential
- Testing: repeated live evaluation, structured validity, containment, latency/token/cost report.

## BL-010 — Conditional bounded AI adapter

- Status/Priority/Complexity: Conditional on BL-009 / P1 / M
- Description: If and only if ADR approves, implement the server-only structured allowlist classifier and deterministic fallback. Otherwise close as not justified.
- Requirements: FR-004, FR-008, FR-009, FR-010, NFR-003, NFR-010, NFR-012
- Acceptance criteria: AC-FR-004-02, AC-FR-008-01/02, AC-FR-009-01, AC-FR-010-01, AC-NFR-003-01
- Dependencies: BL-009 pass
- Testing: adapter mocks, injection/invalid IDs/extra advice/timeouts, live release regression.

## BL-011 — Security, reliability, accessibility, and observability hardening

- Status/Priority/Complexity: Blocked by core product / P0 / L
- Description: Close platform/access, error, rate, logging, privacy, performance, accessibility, and incident-diagnostic gates.
- Requirements: FR-010, NFR-004, NFR-007, NFR-008, NFR-009, NFR-010, NFR-011, NFR-012
- Acceptance criteria: all corresponding NFR ACs
- Dependencies: BL-006/007 and BL-010 if used
- Testing: threat controls, secret/bundle scan, policy tests, failure injection, logs, performance, accessibility manual/automated.

## BL-012 — Comparative resident usability validation

- Status/Priority/Complexity: Blocked by BL-011 / P0 / M
- Description: Run the approved small official-workflow versus navigator study, report limitations/failures, and create bounded corrective backlog.
- Requirements: FR-001, FR-006, FR-008, FR-009, FR-011, NFR-004, NFR-005, NFR-006, NFR-012
- Acceptance criteria: AC-NFR-005-02 and AC-V1-01
- Dependencies: BL-011; human participants/consent
- Testing: protocol dry run, raw/aggregate metric verification, de-identification review.

## BL-013 — Controlled Supabase and Vercel production release

- Status/Priority/Complexity: Blocked by all release gates / P0 / L
- Description: Create authorized external resources, apply approved schema/data, configure environment secrets, connect GitHub/Vercel, deploy, smoke test, and record rollback/operations evidence.
- Requirements: NFR-007, NFR-008, NFR-011, NFR-014
- Acceptance criteria: AC-NFR-007-01, AC-NFR-008-01, AC-NFR-011-01, AC-NFR-014-01
- Dependencies: BL-011, BL-012 and credentials/owner approval
- Testing: migration/access, full production E2E, HTTPS/security, log diagnosis, rollback drill.

## BL-014 — V1 release audit and tag

- Status/Priority/Complexity: Blocked by BL-013 / P0 / M
- Description: Audit every requirement/AC, source freshness, risk, known limitation, documentation, production behavior, and V1 DoD; tag only if all gates pass.
- Requirements: all FR-001–FR-013 and NFR-001–NFR-014
- Acceptance criteria: all functional/nonfunctional ACs, AC-V1-01, AC-V1-02
- Dependencies: BL-001–BL-013 as applicable
- Testing: traceability audit, full CI/evaluation evidence, production smoke recheck.
