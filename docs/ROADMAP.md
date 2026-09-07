# Roadmap

Roadmap items are V1 milestones, not speculative future-version promises.

## M0 — Foundation (Stage 1)

Problem, scope, requirements/ACs, UX, architecture, data/API/AI design, evaluation/testing/security/operations, workflow, ADRs, risks, backlog, and Definition of Done. Exit: the 34 numbered handoff checks are reconciled, the human approves the candidate, and the final Stage 1 foundation is committed and pushed; no functionality/schema/resource/deployment is created. **Complete at `aa3a296`.**

## M1 — Authoritative data

BL-001 pilot source inventory, then BL-002 freeze the 15–25-category set and reviewed canonical dataset. Exit: every proposed category has bounded primary-government evidence or is excluded; gaps/conflicts/freshness are explicit. **Complete on `main` at `cd7f2fa`.**

## M2 — Deterministic foundation

BL-003 reproducible app/CI scaffold, BL-004 Supabase schema/access/reference data, and BL-005 end-to-end deterministic lookup slice. Exit: exact aliases return reviewed evidence; unsupported/error paths are safe; anonymous writes fail. **Complete on `main`; BL-005 squash-merged at `c33c25d`.**

## M3 — Core UX and provenance

BL-006 implements all four mobile/accessibility states; BL-007 completes inspectable evidence/freshness for frozen categories. Exit: a resident can complete/recover from every state and inspect an official source. **BL-006 is merged at `9853528`. BL-007's implementation candidate exposes stored evidence and freshness, adds manual source-review behavior, and adds full canonical regression coverage; CI and human merge review remain pending.**

## M4 — Measured baseline and conditional AI

BL-008 runs deterministic evaluation. BL-009 measures whether bounded AI is useful. BL-010 implements an AI adapter only if the gate passes; otherwise it closes as “not justified.” Exit: frozen regression evidence and explicit AI/no-AI decision.

## M5 — Evaluation and hardening

BL-011 completes security/reliability/observability/accessibility gates. BL-012 runs the small comparative user validation and creates bounded fixes. Exit: safety/accessibility gates pass and the measurable-outcome decision is reported.

## M6 — Deployment

BL-013 creates authorized Supabase/Vercel production resources, applies reviewed migrations/data, deploys the tested commit, verifies the full path, logging, HTTPS, rollback, and records evidence. No earlier milestone deploys.

## M7 — V1.0

BL-014 audits requirements, AC-V1 gates, known limitations, source freshness, security, operations, README, and release evidence; tag v1.0.0 only if DEFINITION_OF_DONE passes.

## M8 — Retrospective

Complete evidence-backed retrospective before considering any Level 2 project. Do not pre-populate a feature roadmap.
