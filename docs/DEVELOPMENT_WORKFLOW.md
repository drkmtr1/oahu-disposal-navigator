# Development workflow

## Traceable change path

Problem → FR/NFR requirement → AC criterion → architecture/user flow → BL backlog item/GitHub issue → focused branch → implementation → tests/evaluation → PR evidence → Definition of Done → merge/release.

No implementation begins from a broad “build the app” instruction. A backlog item may become a GitHub issue when work starts; the issue title begins with its BL ID and links requirement/AC IDs.

## Per-item workflow

1. Read AGENTS and relevant docs; inspect code, tests, configuration, and Git state.
2. State the BL ID, requirements, ACs, expected files/tests, boundaries, assumptions, and rollback.
3. Create a focused branch: codex/BL-###-short-name for Codex work; feat/BL-###-short-name, fix/BL-###-short-name, or docs/BL-###-short-name are acceptable human patterns.
4. Implement only the item; justify any dependency or documented architecture change before adding it.
5. Add tests mapped to ACs and run proportionate local checks.
6. Review security, accessibility, reliability, source provenance, and observability as applicable.
7. Update docs/ADR/backlog status only when evidence changes.
8. Commit coherent changes using conventional prefixes (feat, fix, docs, test, chore) and include the BL ID, for example: feat(BL-004): add deterministic lookup slice.
9. Push and open a PR with problem, scope/exclusions, requirement/AC mapping, file summary, tests/results, screenshots when UI, data/source review when applicable, risk/rollback, and unresolved items.
10. Confirm CI, inspect the full diff, and explicitly verify ACs. Do not dismiss a real test to make CI pass.
11. Squash merge a focused PR into main after approval/checks. Delete the branch when safe.
12. Deploy only in an authorized release task; record production evidence separately.

## GitHub settings and releases

When implementation starts, enable main protection as supported: PR required, required CI checks, resolved conversations, and no force push/deletion. Solo self-approval may be unavoidable; compensate with an AC checklist and complete diff review. Use squash merge for readable one-item history. Tag the accepted release v1.0.0; use pre-release tags only when they provide real test value.

## Documentation and decisions

Requirements and ACs precede code. Update architecture/ADR before or in the same PR as a deliberate deviation. Keep PROJECT_HANDOFF historical. Do not rewrite evidence to match implementation. New requirements require acceptance criteria and backlog mapping. Preserve stable IDs.

## Stage 2 completion report

Report implementation, files, IDs, tests added/executed/results, acceptance evidence, architecture/docs changes, assumptions, risks/debt, and one next smallest item. Stop rather than automatically executing it.

## Change rollback

Prefer small PRs and forward fixes. Application changes roll back by reverting the focused merge or Vercel artifact; database changes use reviewed forward migrations after production. Destructive resets, secret exposure, or broad unrelated reversions are never normal workflow.
