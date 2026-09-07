import assert from "node:assert/strict";
import test from "node:test";

import { runEvaluation } from "../scripts/run-deterministic-evaluation.mjs";

function stableResult(result) {
  const metrics = Object.fromEntries(
    Object.entries(result.metrics).filter(([key]) => key !== "latency_ms"),
  );
  return {
    evaluationId: result.evaluationId,
    evaluationStatus: result.evaluationStatus,
    evaluationDate: result.evaluationDate,
    sourceDataVersion: result.sourceDataVersion,
    caseCount: result.caseCount,
    metrics,
    mismatches: result.mismatches,
    cases: result.cases.map((caseResult) => Object.fromEntries(
      Object.entries(caseResult).filter(([key]) => key !== "durationMs"),
    )),
  };
}

test("BL-008 / AC-NFR-003-01: the versioned baseline repeats deterministically", async () => {
  const first = await runEvaluation();
  const second = await runEvaluation();

  assert.deepEqual(stableResult(first), stableResult(second));
  assert.equal(first.caseCount, 155);
  assert.equal(first.evaluationStatus, "pending_human_review");
});

test("BL-008 / AC-FR-003-01/02 and AC-FR-009-01: deterministic safety gates pass", async () => {
  const result = await runEvaluation();

  assert.equal(result.metrics.canonical_alias_accuracy.percent, 100);
  assert.equal(result.metrics.ambiguity_accuracy.percent, 100);
  assert.equal(result.metrics.unsupported_abstention_accuracy.percent, 100);
  assert.equal(result.metrics.invalid_input_accuracy.percent, 100);
  assert.equal(result.metrics.failure_containment_accuracy.percent, 100);
  assert.equal(result.metrics.critical_safe_handling.percent, 100);
  assert.equal(result.metrics.false_supported_rate.false_supported, 0);
});

test("BL-008 / AC-FR-005-01: successful answers retain exact reviewed provenance", async () => {
  const result = await runEvaluation();

  assert.equal(result.metrics.citation_association.percent, 100);
  assert.equal(result.metrics.unsupported_claim_count, 0);
});

test("BL-008: baseline records unresolved supported-language cases without hiding them", async () => {
  const result = await runEvaluation();

  assert.equal(result.mismatches.length, 29);
  assert.ok(result.metrics.supported_classification_accuracy.percent < 100);
  assert.ok(
    result.mismatches.every(
      (record) =>
        record.expectedDecision === "success" && record.actualDecision === "unsupported",
    ),
  );
});
