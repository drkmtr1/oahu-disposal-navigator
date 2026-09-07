# BL-008 deterministic baseline evaluation

Status: **Evaluation candidate pending independent human label review and pull-request approval.** Results below are reproducible implementation evidence, not an approved frozen benchmark.

## Technical summary

The exact-alias resolver safely handled all 82 unambiguous canonical aliases, the one reviewed alias collision, all 31 unsupported cases, all eight invalid inputs, and all four simulated dependency/evidence failures. Every one of its 82 successful responses retained the exact reviewed guidance, source, and evidence, with zero unsupported claims. It did not resolve 29 deliberately harder supported descriptions, producing 73.87% supported-item coverage and 81.29% overall accuracy. This is the measured gap BL-009 may evaluate; BL-008 does not change product matching behavior or justify AI.

## Key findings

| Measure | Result | Interpretation |
|---|---:|---|
| Overall decision accuracy | 126/155 (81.29%) | All 29 misses were safe unsupported responses for harder supported wording. |
| Exact canonical alias accuracy | 82/82 (100%) | AC-FR-003-01/02 deterministic fixture gate passes. |
| Reviewed ambiguity accuracy | 1/1 (100%) | The shared `battery` alias returns all reviewed candidates. |
| Supported classification / coverage | 82/111 (73.87%) | Exact matching leaves 24 ordinary-language and five misspelling cases unresolved. |
| Unsupported abstention | 31/31 (100%) | No unsupported, hazardous-uncertainty, injection, or out-of-scope case received guidance. |
| Invalid-input handling | 8/8 (100%) | Bounded validation behavior is preserved. |
| Failure containment | 4/4 (100%) | Stale, malformed, future-dated, and database-failure simulations fail safely. |
| Critical safe handling | 34/34 (100%) | The critical safety gate passes. |
| Citation association | 82/82 (100%) | Each success matched its canonical source and evidence. |
| Unsupported claims | 0 | The claim-safety gate passes. |
| False-supported rate | 0/44 (0%) | No expected non-success case became a success. |

Development accuracy was 84/96 (87.50%); holdout accuracy was 42/59 (71.19%). Holdout labels remain visible in version control for auditability but must not be used to tune behavior before the independent label review is complete.

## Scope, data, and metrics

The versioned case set is [`data/evaluation/deterministic-baseline-cases.json`](../data/evaluation/deterministic-baseline-cases.json). It contains 155 cases tied to canonical source-data version `2026-09-05.bl-002-approved.1`: 96 development, 59 holdout, and 34 critical-safety cases. Its 83 generated alias/collision cases cover all unique approved normalized aliases; 72 curated cases cover ordinary wording, misspellings, ambiguity, unsupported household and commercial items, hazardous uncertainty, malformed input, prompt injection, and dependency/evidence failures.

Accuracy means the returned decision and allowed category/candidate set exactly match the reviewed label. Coverage is the share of expected-supported cases that resolve successfully. Citation association requires the returned organization, title, URL, evidence summary, and evidence locator to equal the canonical record. Execution timing measures only the in-process resolver with an in-memory repository; it excludes HTTP, PostgreSQL, network, browser, and hosted-service latency and is therefore diagnostic rather than a production performance claim.

## Methodology and reproducibility

`scripts/generate-deterministic-evaluation-cases.mjs` derives canonical fixtures and checks that the committed file has not drifted. `scripts/validate-deterministic-evaluation.mjs` validates labels, splits, identifiers, simulations, and complete alias coverage. `scripts/run-deterministic-evaluation.mjs` runs the existing production resolver against canonical in-memory data, audits returned claims/provenance, reports metrics, and fails on any safety-gate regression. `tests/evaluation.test.mjs` compares two runs after removing timing-only fields.

Run:

```text
npm run evaluation:verify-cases
npm run validate:evaluation
npm run evaluate:deterministic
npm test
```

The evaluation date is `2026-09-06`; runtime/version evidence is supplied by the pinned Node environment and the eventual Git commit/CI run. No model, provider credential, network call, or generated label is used.

GitHub Actions run `34083742718` passed both the Foundation job containing this evaluation and the Docker-backed Database job on PR #6.

## Limitations and robustness

- The curated labels and critical-safety designations are pending independent human review; they are not frozen merely because validation passes.
- The development/holdout split is deterministic and versioned, not statistically representative of Oʻahu residents.
- The 29 unresolved inputs measure exact matching limitations. They are not authorization to broaden aliases where type, size, chemistry, quantity, or condition affects safety.
- Latency is in-process only. Hosted end-to-end performance belongs to later hardening/release work.
- A compact audit table is clearer than a chart for these bounded exact counts, so no decorative visualization was added.

## Recommended next step

Have a person independently review every curated label, rationale, split, and critical-safety flag, especially the 29 supported-language misses. After approval and merge, BL-009 is the next conditional experiment: compare bounded classification options only on the frozen hard/holdout set under every gate in `EVALUATION_PLAN.md`. Do not add an AI adapter unless that experiment justifies it.

## Further questions

- Do the 29 supported labels preserve every safety-relevant qualifier in the authoritative dataset?
- Is the 59-case holdout sufficiently varied for a bounded AI/no-AI decision without overstating generalization?
- Should any reviewed hard case be reclassified as intentionally unsupported before the set is frozen?
