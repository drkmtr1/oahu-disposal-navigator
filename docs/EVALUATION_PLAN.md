# Evaluation plan

Evaluation is reproducible, versioned, and separated into deterministic behavior, optional AI classification, answer/provenance safety, and resident UX. Stage 1 defines the plan; it performs no user test or model experiment.

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

## Answer and provenance evaluation

For every active category, verify that displayed action/requirements/where fields match the reviewed canonical record, all important claims have evidence, source organization/title/URL/date are correct, URLs are official and reachable at review time, and stale/unreviewed records cannot render success. Metrics: answer support rate, citation correctness, unsupported-claim rate, stale-evidence containment, and source-link success.

## UX comparison

Run a small moderated comparative test after the product is usable, with approximately 6–10 consenting adult participants varied in age, device comfort, and government-site familiarity. This is directional portfolio research, not representative population research. Counterbalance task/order where practical.

Each participant completes comparable supported, ambiguous, and unsupported tasks using:

1. the current official-information workflow alone;
2. the navigator workflow.

Observe without coaching after the start instruction. Measure task completion/correct method, completion time, wrong actions, invalid submissions, recovery failures, initial-action comprehension, result interpretation, source-identification success, and notable accessibility/usability barriers. Do not collect sensitive personal information; report aggregate/de-identified observations.

The V1 outcome gate requires no critical safety error and either a ≥15 percentage-point completion-rate gain or ≥25% lower median completion time, with navigator completion ≥80% and official-source identification ≥80%. These deliberately material thresholds reduce the chance of claiming value from small noise. Report raw counts, medians, sample/task details, and limitations.

## Accessibility and failure evaluation

Test keyboard-only completion, focus order/visibility, status announcements, zoom/reflow, target size, color contrast, meaningful links, representative screen reader behavior, mobile widths, slow/failing dependencies, and error recovery. Serious/critical automated findings or blocking manual failures prevent release.

## Reproducibility and reporting

Version dataset, source-data version, application commit, configuration, model/provider version, run date, environment, and evaluation code. Keep normal CI deterministic with mocked/recorded model outputs. Live provider runs are explicit, budgeted release/model-change checks. Publish a concise results/failure analysis with false positives, false negatives, unresolved cases, and corrective backlog items; never edit the test set merely to hide regressions.
