# BL-014 V1 release audit

## Audit status and boundary

**Status: complete.** This is the V1 release-audit record for the Oʻahu Household Item Disposal Navigator. It evaluates the frozen 15-category, deterministic-only product against the approved requirements, acceptance criteria, production evidence, source-freshness records, risks, and [Definition of Done](DEFINITION_OF_DONE.md). It does not add a category, disposal claim, AI path, data source, or application feature.

- Audit branch: `codex/BL-014-v1-release-audit`
- Production URL: <https://oahu-disposal-navigator.vercel.app/>
- Canonical dataset: `2026-09-05.bl-002-approved.1`
- Release approach: squash-merge this audit only after required CI passes; then create and push annotated tag `v1.0.0` from the merged `main` commit.

The current production runtime was deployed from `32e91eee4c3a0342aeb90fbe75f5ce8469392107`. BL-013's later `cf340e6` release-record and migration-history changes do not alter application runtime code; the associated read-only migration was already applied and verified in the hosted database. This audit does not misrepresent the production runtime as a deployment of the audit-only documentation commit.

The V1 source records were human-verified on 2026-09-05. All three are approved and current for this audit: the dynamic HHW source is due for review on 2026-10-05, and the two resident-drop-off/e-waste sources are due on 2026-12-04. This audit does not present an automated reachability check as a replacement for the required human source-review process.

## Scope and architecture audit

The release remains within the Level 1 contract:

- 15 approved Oʻahu residential household categories; no commercial, construction, account, map, routing, native-app, general-chat, vector-search, or autonomous-agent feature.
- One Next.js TypeScript application on Vercel, with same-origin `POST /api/disposal-options` and curated Supabase PostgreSQL reference data.
- Deterministic normalized-alias matching first. ADR-011 records why the optional AI path is disabled; no model credential, adapter, or live model call is in V1.
- One exposed, read-only `api.disposal_lookup` projection; `private` curation/provenance tables are not exposed. The hosted allow/deny verification is recorded in [BL-013 production release record](BL-013_PRODUCTION_RELEASE.md).

## Requirement and acceptance-criterion evidence

| Area | Requirement / criterion | Release evidence | Result |
|---|---|---|---|
| Entry and validation | FR-001, FR-002; AC-FR-001-01, AC-FR-002-01/02 | Route/API tests plus 11-browser-test suite cover labelled entry, keyboard submit, normalized valid input, and no-lookup invalid input. | Pass |
| Deterministic selection | FR-003; AC-FR-003-01/02 | 155-case deterministic evaluation: 82/82 exact canonical aliases and 1/1 reviewed ambiguity correct; no model path. | Pass |
| Conditional AI | FR-004; AC-FR-004-01 | BL-009 recorded experiment failed its required critical-safety gate; ADR-011 keeps V1 deterministic-only. AC-FR-004-02 is not applicable because no AI path is enabled. | Pass / N/A |
| Curated guidance and presentation | FR-005, FR-006; AC-FR-005-01, AC-FR-006-01 | Canonical provenance regression, database integration CI, browser suite, and production mattress smoke result. | Pass |
| Provenance and freshness | FR-007, FR-013; AC-FR-007-01, AC-FR-013-01 | 15 evidence records, three approved primary City sources, source-verification history, stale/unreviewed exclusion tests, and visible production provenance metadata. | Pass |
| Safe uncertainty | FR-008, FR-009, FR-010; AC-FR-008-01/02, AC-FR-009-01, AC-FR-010-01 | Browser/unit failure tests; production `battery` returns bounded clarification without guidance and `toaster` returns safe unsupported fallback. | Pass |
| Resident recovery and trust | FR-011, FR-012; AC-FR-011-01, AC-FR-012-01 | Browser tests cover edit/search-again and visible official-source trust copy. | Pass |
| Scope and source authority | NFR-001, NFR-002; AC-NFR-001-01, AC-NFR-002-01 | Approved 15-category dataset, source inventory, human source-review record, and canonical provenance regression. | Pass |
| Safety metrics | NFR-003; AC-NFR-003-01 | Deterministic release set: citation association 82/82, unsupported claims 0, critical safe handling 34/34. | Pass |
| Accessibility and responsive UX | NFR-004, NFR-005, NFR-006; AC-NFR-004-01/02/03, AC-NFR-005-01/02, AC-NFR-006-01 | 11 Playwright/axe/reflow tests passed; owner manual 200% zoom, keyboard/focus, and Narrator review reported no blocking issue; frozen resident-task benchmark 20/20. | Pass |
| Production performance | NFR-007; AC-NFR-007-01 | BL-013 sequential production sample: p50 393.5 ms, p95 582.5 ms, max 893.1 ms for deterministic lookup; no AI path. | Pass |
| Access and secret safety | NFR-008; AC-NFR-008-01 | Server-only production variables, client-bundle and secret scans, Docker-backed database allow/deny CI, and hosted SELECT-only verification. | Pass |
| Privacy and safe failure | NFR-009, NFR-010; AC-NFR-009-01, AC-NFR-010-01 | No account/location/history design, storage test, bounded logging tests, dependency-failure injection, and safe production error observation. | Pass |
| Observability and CI | NFR-011, NFR-012; AC-NFR-011-01, AC-NFR-012-01 | Sanitized structured-event drill, current local validation, and required GitHub Foundation/Database CI jobs. | Pass |
| Traceability and topology | NFR-013, NFR-014; AC-NFR-013-01, AC-NFR-014-01 | Backlog/requirements/AC mapping, focused PR history, ADRs, GitHub → Vercel → same-origin server → Supabase review, HTTPS and environment separation. | Pass |
| Product outcome | AC-V1-01 | Frozen 20-case non-participant benchmark: expected-state completion 20/20, source association 10/10, critical safe handling 8/8, unsupported claims 0. | Pass |
| V1 release readiness | AC-V1-02 | This audit, BL-013 production record, requirement/AC mapping, source freshness status, risk review, DoD review, and final CI/PR evidence. | Pass |

## Current production recheck

The live production endpoint was rechecked during this audit:

- `old mattress` returned structured mattress guidance with City organization, meaningful official URL, bounded evidence, and verification/review dates.
- `battery` returned a small clarification choice set and no disposal instruction before selection.
- `toaster` returned the unsupported state and official City fallback with no inferred instruction.
- The home page returned HTTPS 200 with HSTS and CSP present.

This recheck confirms the resident-facing success, ambiguity, and unsupported paths. Failure injection, storage/privacy, and all viewport/accessibility variants remain covered by the automated suite rather than attempting to induce faults in production.

## Definition of Done and risk review

All V1 Definition of Done gates are evidenced by the records above and prior focused backlog evidence. Specifically, backup availability, the named recovery owner/24-hour objective, application rollback, and reviewed forward-only data/schema correction are documented in BL-013. The project owner removed the destructive logical export/restore drill from V1 release requirements; it is not claimed as completed.

No unresolved high-severity release defect was found. Important limitations remain visible rather than treated as defects:

- Exact deterministic matching safely leaves 29 harder supported descriptions unresolved; V1 does not infer a category.
- The resident-task benchmark verifies reproducible designed behavior, not observed human comprehension, ease, speed, or representative resident outcomes.
- The three official sources require future human review on their recorded cadence; no agent may advance their approval status alone.
- Vercel currently runs in `iad1` while the Supabase project is in `us-west-1`; the observed production p95 passes, but latency must be rechecked if it regresses.
- A destructive recovery drill is an optional future exercise, not V1 evidence.

The risk register's high-severity source integrity, safety, accessibility, database-write, secret-exposure, privacy, and migration risks have passing preventative/detection evidence. Continued operation requires the documented source-review, incident, and dependency-review practices.

## Release decision

The required CI and preview checks passed, the full audit diff was reviewed for scope creep, and BL-014 was squash-merged. The annotated `v1.0.0` tag identifies the merged V1 release-audit commit.
