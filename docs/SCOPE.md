# Scope

## Required for V1

- Oʻahu-only residential household disposal guidance.
- Approximately 15–25 canonical categories selected from verified primary-government evidence.
- One plain-language item input and one submit action.
- Input normalization, validation, and deterministic alias matching.
- Optional bounded AI classification only after a measured need is shown.
- Canonical database lookup of curated disposal instructions.
- Structured results with category, action, requirements, supported destination/program information, source, and verification date.
- Initial, success, ambiguous, and unsupported/error states.
- Safe behavior for missing evidence and service/model failures.
- Manual source freshness review and provenance history.
- Mobile-first, keyboard-usable, screen-reader-compatible, plain-language UI.
- Deterministic tests, security/access tests, accessibility/E2E checks, regression evaluation, comparative user testing, and public Vercel release.

The supported category list is deliberately not frozen in Stage 1. Examples in the mandate are candidates, not support promises.

## Useful but defer

- Additional source-review tooling beyond a documented manual workflow.
- A grounded model-written plain-language explanation if deterministic authored summaries prove inadequate.
- Additional observability beyond Vercel/Supabase logs and structured application events.
- More categories after V1 evidence, evaluation, and operations are stable.
- Multilingual discovery research before any implementation commitment.

## Future-level capability

- Native mobile clients, photo recognition, advanced semantic retrieval, automated source-change monitoring, and partner integrations.
- Expanded geographic or waste domains.

These are not roadmap commitments.

## Unnecessary for the current problem

Accounts, authentication, profiles, saved history, personalization, maps, GPS, routing, booking, illegal-dumping reporting, emails/calls, marketplaces, commercial/construction guidance, exhaustive item coverage, chatbot history, autonomous agents, multi-agent orchestration, microservices, Kubernetes, event-driven architecture, model training/fine-tuning, vector databases/embeddings, background queues, real-time sync, complex authorization, and elaborate analytics/design systems.

## Boundaries

- Geography: island of Oʻahu; no neighbor-island guidance.
- User/domain: residents and common household items; no business/regulatory advice.
- Authority: City and County of Honolulu first; State/other primary government only when necessary.
- Safety: unknown substances, hazardous ambiguity, conflicting guidance, and unsupported facility claims must escalate or abstain.
- Interaction: one lookup flow; no required category selection, account, location permission, or technical knowledge.
- Data: curated reference data, not arbitrary live-web retrieval.
- AI: allowlisted classification only unless a later ADR justifies grounded rewriting; never disposal-rule generation.
- Operations: manual source review is sufficient; no autonomous monitoring.

## Scope-change control

Classify every proposal as Required for V1, Useful but defer, Future-level capability, or Unnecessary. A V1 change is legitimate only when supported by a defect, authoritative-source evidence, evaluation/user-test evidence, accessibility need, security/reliability need, or an existing requirement that cannot otherwise be met.

A scope change requires:

1. documented evidence and affected requirement IDs;
2. impact on source coverage, risk, architecture, tests, schedule, and Definition of Done;
3. an ADR when architecture or a major boundary changes;
4. updated acceptance criteria and backlog before implementation;
5. explicit approval.

Novelty, vendor availability, or portfolio appearance alone is not justification.
