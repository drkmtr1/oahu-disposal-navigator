# Source review and freshness runbook

This runbook governs manual review of the authoritative sources behind V1. It implements the freshness lifecycle in [DATA_MODEL.md](DATA_MODEL.md), the authority rules in [SOURCE_INVENTORY.md](SOURCE_INVENTORY.md), and FR-005, FR-007, and FR-013. It does not authorize autonomous monitoring, scraping, inferred disposal rules, or direct production edits.

## Ownership and review triggers

The project owner or a named human reviewer performs and approves every source review. Begin a review before `review_by`, whenever an official page changes or becomes unavailable, when a resident-facing claim is questioned, and before a release if the recorded review window would expire during release review. The HHW source uses a 30-day cadence because it contains time-sensitive event information; the other current City sources use 90 days.

An agent may locate pages, compare text, and prepare a candidate change. It may not mark evidence approved or advance `last_human_verified_on` without recorded human verification. Search results, snippets, cached copies, blogs, commercial sites, and model knowledge are discovery aids only.

## Review procedure

1. Open the exact HTTPS URL in `data/v1-canonical-dataset.json`; do not substitute a search-result summary.
2. Confirm the page belongs to the recorded government organization and domain. Record redirects or title/URL changes for review.
3. Compare the source title, apparent update/effective date when shown, and every stored evidence locator, supporting summary, claim scope, restriction, action, requirement, and destination statement that depends on the source.
4. Check both accepted and excluded/prohibited material. Preserve contradictions as conflicts; do not resolve them by inference.
5. Check whether dynamic details, such as event dates, have leaked into durable guidance. A changing detail stays behind the official link unless separately reviewed and modeled.
6. Choose one outcome from the matrix below and write concise notes describing what was checked. Use a stable reviewer reference rather than personal contact information.
7. Make the canonical-data and database-update candidate described below. Run all validators and tests, obtain human approval in the focused pull request, then deploy only through an authorized release task.

## Outcome and eligibility matrix

| Verification result | Source review status | Production behavior | Required next action |
|---|---|---|---|
| `confirmed` | `approved` | Eligible through the new `review_by` date | Append verification; advance current source snapshot and cadence date |
| `changed` | `expired` | Immediately excluded | Reconcile every affected claim; a later human-confirmed review may restore approval |
| `unavailable` | `expired` | Immediately excluded | Confirm whether the outage is temporary, locate an official replacement, and re-review |
| `conflict` | `conflict` | Immediately excluded | Record both official statements and obtain authoritative resolution or narrow/exclude the category |

Use `rejected` when a candidate source is determined not to be an acceptable authority. A changed page that is fully reconciled and human-approved in the same review may be recorded as `confirmed`, with the reviewed change explained in notes. Never leave an unresolved change marked approved.

## Version-controlled update

The canonical JSON is the factual source of truth. For each review:

1. Append one `source_verifications` record with a unique stable ID, source ID, verification date, allowlisted result, notes, apparent update date or `null`, and reviewer reference. Never rewrite or delete earlier records.
2. Align the source snapshot with the newest verification: `last_human_verified_on`, `apparent_updated_on`, `verification_notes`, and `review_status`. For `confirmed`, set `review_by` to the verification date plus the documented cadence. Non-confirmed sources remain ineligible regardless of the stored date.
3. If a factual claim changed, update its bounded evidence summary, locator, scope, human-review metadata, and linked guidance only after human review. Deactivate or expire any category, guidance, alias, or evidence record that no longer has complete support.
4. Keep unknown apparent dates as `null`. Do not invent dates, locations, quantities, conditions, or restrictions.
5. Run `npm run validate:data`, `npm run db:generate-seed`, and `npm run db:verify-seed`. Review the generated seed; do not edit it by hand.

After a production database exists, a focused reviewed data migration must apply the same change transactionally: append the verification history first and update the current source/evidence eligibility snapshot in the same transaction. For a non-confirmed result, make the source ineligible before serving another lookup. Do not use ad hoc dashboard edits. The schema itself remains governed by the declarative-schema workflow.

## Pull request and verification evidence

The focused pull request must identify affected source, evidence, category, requirement, and acceptance-criterion IDs; include the authoritative URLs inspected; state the reviewer and review date; explain changes, conflicts, and exclusions; and report data, seed, unit, integration, database, E2E, secret, build, and relevant link checks. Database tests must demonstrate that overdue, expired, conflicted, unavailable, or unreviewed support cannot produce a lookup row.

If a source cannot be opened or a claim cannot be re-established, stop and keep it ineligible. Roll back a bad data release by deploying the last reviewed data commit while preserving the append-only verification record and documenting the incident.
