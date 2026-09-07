# Evaluation plan

Evaluation is reproducible, versioned, and separated into deterministic behavior, optional AI classification, answer/provenance safety, and resident-task behavior. Stage 1 defined the plan; later accepted decisions govern implemented evidence.

## Frozen case set

Create versioned cases only after the V1 category/source set is reviewed. Each case has ID, input, expected decision, allowed category/candidates, critical-safety flag, rationale, and source-data version. Keep development and blind holdout subsets. Include:

- canonical names and exact aliases;
- synonyms and colloquial Oʻahu/ordinary wording;
- misspellings and punctuation/case variants;
- materially ambiguous terms;
- unsupported household and out-of-domain commercial items;
- unknown chemicals and hazardous ambiguity;
- empty, long, malformed, and irrelevant input;
- direct prompt injection and “ignore authoritative data” requests;
- simulated missing/stale evidence, provider errors, and malformed structured output.

No test label is generated solely by the model. A human reviews labels and critical cases.

BL-008 implements the approved case schema, generator, validator, runner, and measured results in [BL-008_DETERMINISTIC_BASELINE.md](BL-008_DETERMINISTIC_BASELINE.md). The project owner completed independent review of its curated labels and critical-safety flags before approving and merging PR #6 at `23ef468`.

## Deterministic baseline

Report canonical classification accuracy, ambiguity accuracy, unsupported/safe-abstention accuracy, coverage (share resolved), false-supported rate, citation association, and execution time. Exact/normalized canonical fixtures must be 100% correct. Critical unsupported/hazardous cases must be 100% safely handled. Every returned claim/source association must be correct and unsupported-claim count must be zero.

## AI decision experiment

Use the same frozen hard/holdout sets, pinned prompt/schema/model configuration, and at least three controlled runs where stochasticity exists. Report aggregate and per-case variance, malformed-output rate, provider failures, latency, token use, and estimated cost.

AI may advance to implementation only if it:

1. improves accuracy on the deterministic unresolved/hard set by at least 10 percentage points or safely resolves at least 20% of previously unresolved supported cases;
2. reaches at least 90% supported-item classification accuracy on the full holdout;
3. preserves 100% safe handling on critical hazardous/unsupported cases;
4. produces 0 unsupported disposal claims and cannot alter guidance;
5. has at least 99% structurally valid output before fallback, with 100% invalid output containment;
6. meets the p95 5-second target under a representative small sample;
7. has documented cost acceptable for the planned public usage;
8. creates no material regression in deterministic cases.

Failing the gate means deterministic-only V1, not a postponed release.

BL-009's recorded experiment in [BL-009_AI_VALUE_EXPERIMENT.md](BL-009_AI_VALUE_EXPERIMENT.md) failed gate 3 with 92.86% critical safe handling despite passing the other measured gates. Accepted ADR-011 therefore selects deterministic-only V1. The live runner remains manual and budgeted; normal CI validates only the bounded recorded artifact.

## Answer and provenance evaluation

For every active category, verify that displayed action/requirements/where fields match the reviewed canonical record, all important claims have evidence, source organization/title/URL/date are correct, URLs are official and reachable at review time, and stale/unreviewed records cannot render success. Metrics: answer support rate, citation correctness, unsupported-claim rate, stale-evidence containment, and source-link success.

## Resident-task benchmark

ADR-012 replaces the proposed recruited-participant comparison with a frozen, reproducible non-participant benchmark. Select exactly 20 cases from the independently reviewed deterministic evaluation corpus, covering supported success, ambiguity, unsupported, invalid-input, missing-evidence, and database-failure behavior. Record stable case IDs, expected states, critical-safety designations, and the benchmark version so another reviewer can rerun the same evidence.

The V1 outcome gate requires at least 80% expected-state completion, 100% safe handling of designated critical cases, 100% official-source association for supported success cases, and zero unsupported disposal claims. Existing automated browser checks and the completed owner accessibility review remain separate evidence for navigation, focus, announcements, reflow, touch targets, and state presentation.

Report case composition, aggregate metrics, failures, configuration, and limitations. This evidence may establish repeatable designed behavior; it must not be described as observed human usability, user research, representative resident outcomes, comprehension, ease, completion time, or superiority over the official workflow. No participant recruitment, consent, observation, personal data, or de-identification process is part of BL-012.

## Accessibility and failure evaluation

Test keyboard-only completion, focus order/visibility, status announcements, zoom/reflow, target size, color contrast, meaningful links, representative screen reader behavior, mobile widths, slow/failing dependencies, and error recovery. Serious/critical automated findings or blocking manual failures prevent release.

## Reproducibility and reporting

Version dataset, source-data version, application commit, configuration, model/provider version, run date, environment, and evaluation code. Keep normal CI deterministic with mocked/recorded model outputs. Live provider runs are explicit, budgeted release/model-change checks. Publish a concise results/failure analysis with false positives, false negatives, unresolved cases, and corrective backlog items; never edit the test set merely to hide regressions.
