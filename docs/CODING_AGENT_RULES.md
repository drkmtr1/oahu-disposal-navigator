# Coding agent rules

These permanent rules supplement root AGENTS.md.

## Before work

1. Read AGENTS.md and task-relevant docs completely.
2. Inspect repository/Git and existing implementation before editing.
3. Name one BL ID, its FR/NFR and AC IDs, expected files/tests, boundaries, assumptions, and rollback.
4. If the task is broad or lacks acceptance criteria, stop and narrow it before implementation.

## During work

- Implement only requested scope; do not silently expand features, abstractions, or architecture.
- Preserve valid behavior and compatibility; avoid unrelated refactors.
- Do not add a dependency/service merely for convenience or fashion. Record need, alternatives, security/size/maintenance cost, and lock it.
- Do not change an accepted architecture decision without an ADR and requirement justification.
- Do not remove, weaken, skip, or rewrite a legitimate test to make checks pass; fix root cause.
- Validate all external input/output at its trust boundary and encode rendered text safely.
- Preserve source URL, organization, title, evidence, category association, review status, and freshness.
- Never use AI/model output, search snippets, blogs, or commercial pages as factual disposal authority.
- Keep model output structured and allowlisted; AI never generates disposal rules or receives tools/secrets.
- Preserve one-task UX, four states, plain language, mobile behavior, keyboard access, focus, source visibility, and safe recovery.
- Follow least privilege. Never expose or log model keys, database secrets/service-role keys, tokens, sensitive information, or unnecessary raw prompts/input.
- Do not add authentication, direct browser elevated access, vector search, agents, queues, microservices, or another host without an approved requirement.
- Use version-controlled migrations/reference data only in the authorized database task.
- Do not deploy, link external resources, change production data/settings, or push/merge unless the task explicitly authorizes it.

## Verification and reporting

Run relevant tests and inspect their real results. Validate acceptance criteria separately from “build passed.” Update documentation when behavior/evidence changes. Report modified files, IDs, tests/results, acceptance evidence, assumptions, unresolved risks, technical debt, and one next task. Do not automatically execute the recommendation.

When blocked by a credential, irreversible decision, external owner action, or manual validation, preserve completed evidence and ask for only that action. Keep secrets local; never ask the user to paste them into chat.
