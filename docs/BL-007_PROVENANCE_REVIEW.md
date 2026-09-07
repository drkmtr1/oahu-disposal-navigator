# BL-007 provenance and freshness review

Date: 2026-09-06

Status: implementation candidate pending pull-request CI and human merge review

Dataset: `2026-09-05.bl-002-approved.1`, schema serialization `1.1.0`

## Scope and result

BL-007 exposes the complete stored evidence summary and current source-freshness snapshot in each successful resident result. The deterministic regression covers all 15 active reviewed categories and all 85 category-alias mappings, including each branch of the intentional `battery` ambiguity. Every successful case exactly matches the canonical action, requirements, destination text, official source, and linked evidence.

The regression reports 85 of 85 citation associations, zero guidance differences from the reviewed records, and safe abstention for 10 bounded critical excluded descriptions covering damaged/unidentified batteries, electric-vehicle/heavy-equipment batteries, paint-related ambiguity, commercial/construction waste, unlisted compressed-gas containers, and the documented telephone conflict. This is BL-007 provenance evidence; BL-008 still owns the independently reviewed frozen development/holdout case set and full baseline report required for the final release-regression gate.

## Canonical inventory audit

| Artifact | Reviewed count | Eligibility result |
|---|---:|---|
| Active categories and guidance | 15 | All approved and source-supported |
| Category-alias mappings | 85 | All deterministic; one declared three-category collision |
| Primary City sources | 3 | All approved and within review window on 2026-09-06 |
| Evidence records | 15 | One or more stored evidence records per active guidance |
| Append-only verification records | 3 | One initial confirmed record per current source |

All current sources are City and County of Honolulu Department of Environmental Services pages on `honolulu.gov`. On 2026-09-06, an agent-assisted reachability/content comparison opened the exact three canonical URLs and found the bounded source sections still available: resident drop-off rules, City e-waste drop bins, and household hazardous waste. The e-waste VOIP/telephone contradiction remains excluded, and changing HHW event details remain outside durable guidance. This comparison did not advance the human verification dates; the recorded project-owner review remains 2026-09-05, with HHW due 2026-10-05 and the other two sources due 2026-12-04.

## Enforcement evidence

- The database projection admits only active, approved category/alias/guidance/evidence and approved sources whose `review_by` is not past.
- Database tests exclude overdue, pending, rejected, conflicted, explicitly expired, and unavailable-result sources/evidence.
- The server validates official HTTPS domains, nonempty evidence, exact alias/locale, source/evidence dates, future dates, review order, and consistent source/evidence rows before returning guidance.
- The browser validates the expanded response union and shows organization, meaningful official link/title, source page date when known, project verification date, review-by date, and progressively disclosed evidence metadata.
- The canonical serialization now stores `source_verifications` explicitly so repeated manual reviews remain append-only and reproducible in generated seed data.

## Acceptance trace

| Criterion | Evidence |
|---|---|
| AC-FR-005-01 | Full canonical regression and local Data API integration compare every returned instruction with its active stored record |
| AC-FR-007-01 | Response/UI E2E exposes official source and freshness metadata; every claim maps to stored evidence shown in the details section |
| AC-FR-013-01 | Runtime date validation plus database stale/status policy tests prevent success from ineligible provenance |
| AC-NFR-002-01 | The audit finds 15 of 15 guidance records backed only by the three primary City sources and 15 reviewed evidence records |
| AC-NFR-003-01 | BL-007 regression has 100% citation association, zero guidance differences, and 100% abstention across its 10 critical exclusions; BL-008 still must freeze and report the complete release case set |

## Remaining boundary and risk

This workstation has no Docker-compatible local runtime, so PostgreSQL policy tests and live Data API integration are delegated to the required GitHub CI database job. No hosted Supabase or Vercel resource exists, no production update was applied, and no source was re-approved by an agent. BL-008 is the next bounded item after BL-007 is approved and merged.
