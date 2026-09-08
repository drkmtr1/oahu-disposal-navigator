# BL-012 resident-task evaluation

- Status: Complete; PR #10 squash-merged to `main` at `6fbf275`
- Decision basis: [ADR-012](DECISIONS.md#adr-012--replace-recruited-participant-study-with-reproducible-resident-task-benchmark)

## Purpose and boundary

BL-012 replaces the former recruited-participant study with a frozen, reproducible, non-participant benchmark. It tests whether representative resident descriptions produce the expected application state while preserving critical-safety abstention and authoritative-source association.

No people were recruited or observed, no consent or personal data was collected, and no de-identification was needed. These results are not human-usability research and do not establish comprehension, ease, speed, population outcomes, or superiority over the official City workflow.

## Method

The versioned fixture selects exactly 20 stable case IDs from the independently reviewed BL-008 deterministic corpus:

- 10 supported-success cases;
- 1 materially ambiguous case;
- 6 unsupported or hazardous-abstention cases;
- 1 invalid-input case;
- 1 missing-evidence case;
- 1 database-failure case.

The dependency-free runner executes the same application evaluation path used by the deterministic baseline, filters results by the frozen IDs, and calculates expected-state completion, supported source association, critical safe handling, and unsupported-claim count. The validator rejects changes to the case count, state composition, human-participant flag, gates, case references, or claim limits.

## Results

- Run date: 2026-09-07
- Fixture version: 1.0.0

| Gate | Result | Threshold | Status |
|---|---:|---:|---|
| Expected-state completion | 20/20 (100%) | at least 80% | Pass |
| Supported official-source association | 10/10 (100%) | 100% | Pass |
| Critical safe handling | 8/8 (100%) | 100% | Pass |
| Unsupported disposal claims | 0 | 0 | Pass |

The complete selected-case IDs, expected states, critical flags, and source expectations are in [`data/evaluation/resident-task-cases.json`](../data/evaluation/resident-task-cases.json). Raw resolver outcomes remain reproducible from the runner and underlying frozen dataset rather than being manually transcribed.

GitHub Actions run `34165136596` passed both Foundation and Docker-backed Database checks before merge.

## Browser and accessibility evidence

BL-006 Playwright/axe tests cover initial, success, ambiguous, unsupported/error, keyboard/focus, status announcements, target sizes, and responsive/reflow behavior. The project owner separately reported that 200% zoom, keyboard/focus, and Windows Narrator worked during the 2026-09-06 manual review. BL-012 does not reinterpret those checks as participant research.

## Source and safety review

The benchmark does not add or alter disposal facts. Supported-source associations resolve through the reviewed canonical dataset and BL-007 provenance regression. On 2026-09-07, the current official City waste-drop-off, e-waste, and household-hazardous-waste pages used by the relevant records were manually reachable over HTTPS; this reachability check is not a new source-content approval or a change to the scheduled freshness review.

All benchmark gates pass, so no corrective backlog item is created. Any future dataset or resolver change must rerun the benchmark and may not weaken its gates to hide a regression.

## Traceability

- Backlog: BL-012
- Requirements: FR-001, FR-006, FR-008, FR-009, FR-011, NFR-004, NFR-005, NFR-006, NFR-012
- Acceptance criteria: AC-NFR-005-02, AC-V1-01
- Evidence: frozen fixture, validator, runner, focused Node tests, existing browser/accessibility suite, and CI commands
- Rollback: revert the BL-012 commit; no database, platform, production, or source-data state is changed.

## Remaining limitation

Real residents may use descriptions or interpret guidance differently from the frozen cases. This project must retain that limitation in release reporting unless separately authorized future participant research supplies appropriate evidence.
