# Acceptance criteria

Each criterion maps to a requirement in REQUIREMENTS. “Release set” means frozen, reviewed fixtures/evaluations, not ad hoc demo prompts.

UX criteria below operationalize the presentation and interaction model in [UX_DESIGN.md](UX_DESIGN.md); user-flow transitions remain in [USER_FLOWS.md](USER_FLOWS.md).

## Functional

- **AC-FR-001-01:** Given the initial page, when a resident uses keyboard or pointer, then they can enter one description and submit without category selection, account, or location permission.
- **AC-FR-002-01:** Given 1–200 meaningful characters, when submitted, then normalization preserves the intended words and the request proceeds.
- **AC-FR-002-02:** Given empty, control-only, or over-limit input, when submitted, then no lookup/model call occurs and a connected plain-language error is visible and announced.
- **AC-FR-003-01:** Given a frozen exact or normalized alias with one active mapping, when submitted, then the expected canonical ID is selected with zero model calls.
- **AC-FR-003-02:** Given an alias shared by active categories, when submitted, then no category is silently selected and an ambiguity result is returned.
- **AC-FR-004-01:** Given the AI gate is disabled or unjustified, when no deterministic match exists, then no model is called.
- **AC-FR-004-02:** Given the AI gate is enabled, when the provider returns malformed data, a non-allowlisted ID, several plausible IDs, or unsupported, then validation prevents a success selection.
- **AC-FR-005-01:** Given a supported category, when guidance is returned, then every instruction is loaded from its active reviewed stored record and not from model text.
- **AC-FR-006-01:** Given complete reviewed guidance, when success renders, then category, action, requirements, optional where information, and official source appear as distinct semantic sections.
- **AC-FR-007-01:** Given success, when the source section is inspected, then organization, meaningful official link/title, and verification date are visible, and each displayed claim resolves to stored evidence.
- **AC-FR-008-01:** Given material ambiguity, when clarification renders, then there are at most four plain-language candidate choices plus “I’m not sure,” and no disposal instruction.
- **AC-FR-008-02:** Given a clarification choice, when selected, then the selected canonical record is retrieved; “I’m not sure” safely abstains.
- **AC-FR-009-01:** Given unsupported, irrelevant, or unresolved input, when handled, then the response explicitly says it is not reliably covered, shows no disposal method, and provides only the approved official fallback.
- **AC-FR-010-01:** Given missing evidence or database/model failure, when the request completes, then the system returns an appropriate deterministic result, retryable error, or abstention and no invented instruction.
- **AC-FR-011-01:** Given any result state, when the resident chooses edit or search again, then they can perform another lookup without persisted account/history state.
- **AC-FR-012-01:** Given a success result, then the visible trust note says official sources create the rules and AI, if used, only interprets the item.
- **AC-FR-013-01:** Given a source is unreviewed, failed, or past its review-by date, when a production lookup occurs, then its guidance cannot produce success.

## Nonfunctional

- **AC-NFR-001-01:** A release audit lists 15–25 active categories, all within Oʻahu residential household scope, and no excluded feature is required by the core flow.
- **AC-NFR-002-01:** A provenance audit finds primary-government evidence for every important instruction and no non-authoritative factual basis.
- **AC-NFR-003-01:** The release regression set reports 100% citation association, 0 unsupported disposal claims, and 100% safe handling for designated hazardous/unsupported critical cases.
- **AC-NFR-004-01:** The full core flow is keyboard-completable with logical focus, visible focus indicators, semantic headings/landmarks, associated labels, status announcements, and errors not conveyed by color alone.
- **AC-NFR-004-02:** At 200% browser zoom, content and controls remain usable without lost information or two-dimensional scrolling at a 1280 CSS-pixel viewport.
- **AC-NFR-004-03:** Automated accessibility checks report no serious/critical findings; manual screen-reader and focus checks have no blocking defect.
- **AC-NFR-005-01:** Primary input/action and clarification targets are at least 44 by 44 CSS pixels; critical actions have visible text, and no step requires hover.
- **AC-NFR-005-02:** In moderated testing, at least 80% of participants begin the correct task without instruction and at least 80% identify the official source after a result.
- **AC-NFR-006-01:** At 320, 375, 768, and 1280 CSS-pixel viewports, all four states have no page-level horizontal scrolling or obscured control.
- **AC-NFR-007-01:** A representative measurement reports deterministic p95 ≤1.5 s and, if present, AI-path p95 ≤5 s; breaches are visible and timeout behavior remains safe.
- **AC-NFR-008-01:** Secret scanning and bundle inspection find no elevated Supabase/model secret; anonymous database tests allow only intended reads and deny insert/update/delete.
- **AC-NFR-009-01:** Product and logs contain no account, location, or deliberate sensitive-data collection; raw input is absent or irreversibly minimized according to SECURITY.
- **AC-NFR-010-01:** Failure-injection tests show database/model faults never create an authoritative-looking unsupported instruction.
- **AC-NFR-011-01:** A simulated failed request can be diagnosed using the minimum sanitized event fields in OBSERVABILITY without viewing secrets or full raw input.
- **AC-NFR-012-01:** Normal CI completes without network-dependent paid model calls and gates all implemented test layers; no legitimate test is skipped without a documented reason.
- **AC-NFR-013-01:** Each merged PR names one or more BL, FR/NFR, and AC IDs and links implementation/tests; architecture changes include an accepted ADR.
- **AC-NFR-014-01:** Deployment review confirms GitHub/Vercel/server/Supabase topology, environment separation, HTTPS, and no private key in browser code.

## V1 product outcome gate

- **AC-V1-01:** In the comparative pilot, the navigator has no critical safety error and achieves either at least a 15 percentage-point task-completion improvement or at least a 25% lower median completion time than the official workflow, while navigator completion is at least 80%.
- **AC-V1-02:** All applicable backlog and V1 Definition of Done checks are evidenced; deployment alone is insufficient.

The effect threshold is intentionally large enough to be meaningful in a small directional pilot. Results will be reported with sample size and raw task outcomes, not generalized to all residents.
