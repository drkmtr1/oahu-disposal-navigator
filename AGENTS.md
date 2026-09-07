# Agent operating manual

This file and approved documents in docs are authoritative after Stage 1. PROJECT_HANDOFF.md remains historical context. If guidance conflicts, use the newest approved requirement or ADR and report the conflict.

Current lifecycle status: Stage 1 and BL-001 through BL-008 are merged to `main`, with BL-008 squash-merged at `23ef468`. Stage 2 proceeds through one bounded backlog item at a time. BL-009's bounded live experiment candidate fails the mandatory critical-safety AI gate and proposes deterministic-only V1; local checks and GitHub CI pass on PR #7, which is pending human review. The live-data path is exercised by Docker-backed CI because this workstation has no compatible local runtime. No hosted Supabase or Vercel resource exists for this application.

## Objective and Level 1 boundary

Build a small, finishable public-interest tool that helps an Oʻahu resident find authoritative disposal guidance for a bounded set of household items. Prefer simple, inspectable solutions. Do not add sophistication for portfolio appearance.

## V1 contract

- Oʻahu residential household disposal only.
- Approximately 15–25 categories, frozen only after authoritative-source discovery.
- One item-description input and one primary task.
- Four states: initial, structured success, ambiguous clarification, and unsupported/error.
- Deterministic alias/category matching first.
- Curated government guidance, visible sources, evidence, and freshness metadata.
- Responsive, broadly accessible, low-friction experience.
- Reproducible tests, evaluation, a small comparative user test, and a simple public release.

Excluded unless an approved requirement changes scope: accounts/auth, profiles/history, maps/geolocation/routing, booking, illegal-dumping reports, commercial or construction waste, exhaustive item coverage, native apps, image recognition, multilingual support, general chat, autonomous agents, microservices, queues, real-time features, vector search, model training/fine-tuning, Kubernetes, and elaborate analytics/design systems.

## Source and AI rules

- Important disposal claims must trace to an official City and County of Honolulu source, primarily ENV, or a necessary State/other primary government source.
- Store URL, organization, title, supporting evidence, apparent update date when available, project verification date, affected category, and review status.
- Discovery sources may not become the factual basis of an answer.
- AI is optional and limited to allowlisted category classification. Grounded rewriting requires separate justification.
- AI must never invent, override, or supplement disposal rules; training knowledge is not evidence.
- Validate structured model output against allowed identifiers. Ambiguity, missing evidence, invalid output, and provider failure produce clarification, deterministic fallback, or abstention.

## UX and accessibility

Keep one obvious action, plain language, visible labels/buttons, limited choices, recoverable errors, and meaningful source links. Do not use chat bubbles, a chatbot sidebar, dashboards, tourist styling, or AI-first branding. Use semantic HTML, associated labels, keyboard completion, visible focus, WCAG 2.2 AA contrast, screen-reader status updates, 44 by 44 CSS-pixel targets for primary controls, 200% zoom support, and mobile-first layouts without horizontal scrolling.

## Architecture

- One Next.js TypeScript application hosted on Vercel.
- Controlled same-origin server routes handle validation, database access, optional model calls, response assembly, and safe logging.
- Supabase PostgreSQL stores curated relational reference data and provenance.
- No V1 Supabase Auth, Realtime, Storage, Edge Functions, or Vector.
- No direct browser access using elevated credentials. Secret/service-role and model keys are server-only; prefer least-privilege access that remains subject to grants and RLS.
- Version-control declarative schema and generated migrations when database work begins. Do not create schema outside its bounded backlog item.
- No separate public API, server host, or additional infrastructure without a requirement and ADR.

## Git and delivery

Do not use main for normal implementation work. Use a focused branch named codex/BL-###-short-name (or feat/, fix/, docs/ for human-created branches), coherent conventional commits, and a pull request that lists requirement IDs, acceptance criteria, tests, risks, and documentation changes. Required checks must pass before squash merge. Vercel previews support review; production release occurs only through an approved release task.

## Stage 2 task protocol

Before editing: read this file and relevant docs, inspect current work and Git state, identify one backlog ID, its requirement IDs, acceptance criteria, expected files/tests, boundaries, and rollback. Implement only that item. Do not add casual dependencies, unrelated refactors, silent architecture, or future features. Never remove or weaken a valid test to pass.

Validate input, preserve provenance, follow least privilege, protect secrets, review accessibility/security/failure behavior, run proportionate tests, and update documentation when behavior changes.

The completion report must state files changed, requirements and criteria addressed, tests run and results, acceptance evidence, assumptions, unresolved risks/debt, and one next smallest task. Do not execute that next task automatically.

## Documentation map

Use PROJECT_OVERVIEW and SCOPE for purpose; REQUIREMENTS and ACCEPTANCE_CRITERIA for obligations; UX_DESIGN, USER_FLOWS, and ARCHITECTURE for presentation and behavior; DATA_MODEL and API_CONTRACTS for boundaries; AI_SYSTEM_DESIGN for AI limits; EVALUATION_PLAN and TESTING_STRATEGY for evidence; SECURITY, OBSERVABILITY, and DEPLOYMENT for operations; DEVELOPMENT_WORKFLOW and CODING_AGENT_RULES for process; DECISIONS and RISKS for judgment; ROADMAP, BACKLOG, and DEFINITION_OF_DONE for sequencing and completion.
