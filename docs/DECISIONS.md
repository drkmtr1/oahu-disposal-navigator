# Architecture decision record

## ADR-001 — GitHub, Vercel, and Supabase topology

- Status: Accepted
- Date: 2026-09-05
- Decision: Git/GitHub is source/history; one Vercel-hosted application provides UI and server routes; Supabase PostgreSQL stores curated data.
- Rationale: These mandated platforms form the smallest comprehensible deployable topology.
- Alternatives: Separate API host, container/VM, microservices.
- Tradeoffs: Platform coupling is accepted; additional services are prohibited without evidence.

## ADR-002 — Next.js TypeScript single application

- Status: Accepted
- Date: 2026-09-05
- Context: The repository contained only the project mandate and no application framework, package manifest, code, test harness, or hosting configuration. V1 needs an accessible browser UI plus a small same-origin server boundary for validation, protected database access, and an optional model call. The solution must remain understandable to one maintainer and deploy cleanly to the required Vercel target.
- Decision: Use Next.js with TypeScript as the one full-stack framework when scaffolding begins.
- Rationale: The empty repository offers no architecture to preserve; one framework covers server-rendered/accessible UI and same-origin server routes on Vercel without a separate backend.
- Alternatives: Static React SPA plus API, SvelteKit, plain server-rendered pages.
- Tradeoffs/consequences: Next.js adds framework conventions, build dependencies, and upgrade responsibility, but removes the need for a separately hosted API and supports one deployable application. Stage 2 must pin versions, commit the lockfile, use only the framework features required by documented behavior, and keep authoritative decisions server-side.
- Revisit conditions: Reconsider only if the Stage 2 scaffold cannot meet Vercel deployment, accessibility, server-boundary, security, performance, or solo-maintenance requirements without disproportionate complexity; if Vercel support materially changes; or if a simpler existing implementation must later be preserved. Any change requires requirement evidence, an ADR superseding this one, migration impact, and explicit approval.

## ADR-003 — Public UI, controlled server boundary, no V1 auth

- Status: Accepted
- Date: 2026-09-05
- Decision: No resident authentication. Browser calls one same-origin read-only lookup route. Supabase access uses least privilege with explicit grants and RLS; normal lookup does not use a service-role secret.
- Rationale: No personal data/account feature needs auth; server validation centralizes safety and secrets.
- Alternatives: Direct browser Data API; Supabase Auth; service-role lookup.
- Tradeoffs: Public abuse/read exposure must be controlled and tested. Exact publishable-key versus narrower database-role mechanism remains an implementation decision.

## ADR-004 — Deterministic-first, conditional bounded AI

- Status: Accepted
- Date: 2026-09-05
- Decision: Normalize/exact-match aliases first. Add allowlisted structured AI classification only after EVALUATION_PLAN gate; deterministic-only V1 is acceptable.
- Rationale: Maximizes reproducibility and minimizes hallucination, latency, and cost.
- Alternatives: LLM-first chat, embeddings/vector retrieval, fine-tuning.
- Tradeoffs: More unfamiliar wording may abstain. That is preferable to unsupported advice.

## ADR-005 — Curated relational provenance and manual freshness

- Status: Accepted
- Date: 2026-09-05
- Decision: Store categories, aliases, authored guidance, official sources, bounded evidence, and verification history relationally. Human review controls approval/expiry; initial review cadence assumption is 90 days.
- Rationale: Government information can change; provenance/freshness is product data. Corpus size does not justify vector retrieval or automated monitoring.
- Alternatives: Flat hard-coded files, live scraping/RAG, autonomous monitoring.
- Tradeoffs: Manual review costs maintainer time and cadence must be validated.

## ADR-006 — Declarative Supabase schema workflow

- Status: Accepted
- Date: 2026-09-05
- Decision: For this new project, schema files in supabase/schemas become desired state; generated/reviewed migrations and seed/test data are version controlled.
- Rationale: Makes current design reviewable while retaining migration history across environments.
- Alternatives: Imperative-only migrations, dashboard edits.
- Tradeoffs: Contributors must always edit declarative files first and review generated SQL. Stage 1 does not create schema files.

## ADR-007 — Non-chat mobile-first civic UX

- Status: Accepted
- Date: 2026-09-05
- Decision: One centered single-column lookup with initial, success, ambiguous, and unsupported/error states; no chat shell.
- Rationale: One obvious task reduces cognitive load and exposes authoritative results/provenance clearly across ages/devices.
- Alternatives: Chatbot, dashboard, map/category browser.
- Tradeoffs: Less exploratory flexibility, stronger task clarity and accessibility.

## ADR-008 — Lightweight solo Git workflow

- Status: Accepted
- Date: 2026-09-05
- Decision: BL-linked focused branch/PR, required checks, self-review, squash merge, and separately authorized releases; no normal direct implementation commits to main.
- Rationale: Creates employer-visible traceability without enterprise ceremony.
- Alternatives: Direct-to-main; long-lived environment branches.
- Tradeoffs: Small process overhead buys auditable decisions and rollback.

## ADR-009 — Keep V1 destination information in authored guidance

- Status: Accepted
- Date: 2026-09-05
- Approval: Accepted through the project-owner BL-002 human review and live-source second pass on 2026-09-05.
- Context: The BL-001 pilot and approved 15-category BL-002 dataset reuse three City programs, but the supported destination wording is tightly coupled to each category's qualifications. V1 does not need maps, routing, live facility lookup, or independent destination browsing.
- Decision: Keep supported destination/program information in each guidance record's nullable `where_summary`; do not add a normalized destination entity or table for V1.
- Alternatives: A shared destination table with category/program relationships; a live facility directory; embedding facility details in aliases.
- Rationale: Authored `where_summary` preserves the exact source-supported boundary with the fewest joins and avoids treating time-sensitive locations as a separate product feature.
- Tradeoffs/consequences: Some destination wording is duplicated and must be reviewed with its guidance. The design cannot independently update or query facilities, which is acceptable because V1 exposes only source-backed where/program text.
- Revisit conditions: Reconsider in BL-004 only if the human-approved dataset reveals independently changing destination attributes, unsafe duplication, or a required many-to-many relationship that cannot be represented without inconsistency. Any expansion to maps, routing, or live facility data requires separate requirements and approval.

## ADR-010 — Dedicated read-only Supabase API projection

- Status: Accepted
- Date: 2026-09-06
- Context: V1 has no resident accounts or writes. The application server needs deterministic access to category aliases and a complete category → guidance → evidence → source/freshness join without using a credential that bypasses RLS. Directly exposing every curation/history table would enlarge the Data API surface, while a `SECURITY DEFINER` function would create unnecessary privilege-escalation risk.
- Decision: Keep curated relational tables in a non-exposed `private` schema. Expose only a `security_invoker` view named `api.disposal_lookup` through a dedicated `api` Data API schema. The normal server path uses a server-only Supabase publishable key acting as `anon`; `anon` and `authenticated` receive explicit SELECT-only grants needed by the view, all base tables enforce RLS, source freshness is checked in both RLS/view filters, and neither role receives write access. Verification history remains inaccessible to those roles. No service-role key or security-definer lookup function is used.
- Alternatives considered: public-schema base tables with direct Data API access; a public security-definer RPC; a custom login/read-only database role with a direct Postgres connection; service-role queries.
- Rationale: The dedicated schema makes the HTTP surface explicit, the caller-privilege view preserves RLS, the atomic read shape prevents incomplete provenance, and the publishable-key path fits the no-auth server architecture with the smallest credential risk.
- Tradeoffs/consequences: The view returns one row per approved alias/evidence relationship and the later server slice must group/validate rows. `anon`/`authenticated` need database-level SELECT and schema-usage grants on private dependencies for a security-invoker view, but those tables are not in an exposed Data API schema. BL-013 must explicitly configure hosted Data API exposure to `api` only and verify platform settings because local `config.toml` does not change a hosted project. Curation continues through reviewed migrations/seeds under owner privileges.
- Revisit conditions: Reconsider only if hosted Data API behavior cannot preserve the dedicated-schema boundary, a measured query/performance limit appears, or an approved curation capability needs a separate write path. Any service-role, security-definer, direct-database, or browser-access change requires a new threat review, tests, and superseding ADR.

## Decision register

- OD-001: Resolved 2026-09-05; the project owner approved the 15-category BL-002 set and the live-source second pass found no material discrepancy.
- OD-002: Resolved 2026-09-05; ADR-009 was accepted through BL-002 review.
- OD-003: Resolved 2026-09-06 by ADR-010; use the dedicated `api` security-invoker view over non-exposed `private` tables with server-only publishable-key/anon access and no service-role lookup.
- OD-004: Whether AI clears the need/value gate and, only then, provider/model/configuration.
- OD-005: Final per-source review cadence and conflict handling, informed by source behavior.
- OD-006: Final production budgets/rate limits and backup/recovery objectives, before deployment.
