# Definition of Done

## Backlog-item Done

An item is Done only when:

- the named requirement behavior is implemented within scope;
- every mapped AC is explicitly evidenced;
- tests/fixtures/evaluations are added or updated and pass;
- input/output validation and error/fallback behavior are complete;
- security/least privilege/privacy are reviewed;
- accessibility and responsive behavior are reviewed when relevant;
- operational logs/metrics exist where relevant and avoid forbidden data;
- authoritative provenance and freshness remain intact;
- documentation and ADRs match actual behavior;
- CI is green with no unexplained skip or weakened test;
- no unresolved critical/high defect or unexplained architecture deviation remains;
- PR/commit/report names BL, requirement, AC, files, tests/results, assumptions, risks/debt, and next task;
- rollback is known and no later backlog item was silently implemented.

## V1 Done

- Supported domain is frozen at 15–25 Oʻahu residential categories.
- Every important claim has approved primary-government evidence and visible provenance.
- Source verification/freshness process is operational and no active source is overdue/conflicted.
- Deterministic baseline and all four UX states work end to end.
- Unsupported, ambiguity, hazardous, missing-evidence, and dependency failures safely abstain/recover.
- Responsive/mobile and agreed WCAG 2.2 AA criteria pass.
- AI is either rejected by the documented gate or bounded, validated, justified, and evaluated.
- NFR-003 safety metrics and all release regression thresholds pass.
- Comparative user test is complete, limitations reported, and AC-V1-01 passes or the project remains pre-V1.
- Security/access/privacy/dependency review has no unresolved high-severity defect.
- Observability can diagnose a failed request without forbidden data.
- GitHub history/CI/traceability and README/docs/known limitations are current.
- Supabase migrations/data/access and Vercel production full-path verification pass.
- Backup/recovery and application/data rollback are documented and checked.
- AC-V1-02 passes, release evidence is recorded, and v1.0.0 can be tagged.
- Retrospective is ready to begin.

Deployment by itself is not Done.

## Stage 1 completion record

The handoff contains exactly 34 numbered Stage 1 completion items. The documentation candidate had to address each item without substituting an internal checklist, include the dedicated UX design required by the human correction, and preserve the corrected A–J Final Report structure with separate platform status. Those gates were approved, committed, and pushed at `aa3a296`; BL-001 was later merged at `db5472b`. Stage 2 does not retroactively alter the Stage 1 completion evidence.
