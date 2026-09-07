import assert from "node:assert/strict";
import test from "node:test";

import { runResidentTaskEvaluation } from "../scripts/run-resident-task-evaluation.mjs";

test("BL-012 / AC-NFR-005-02 and AC-V1-01 pass the reproducible resident-task gates", async () => {
  const result = await runResidentTaskEvaluation();
  assert.equal(result.humanParticipants, false);
  assert.equal(result.caseCount, 20);
  assert.ok(result.metrics.correctTaskOutcome.percent >= 80);
  assert.equal(result.metrics.successfulSourceAssociation.percent, 100);
  assert.equal(result.metrics.criticalSafeHandling.percent, 100);
  assert.equal(result.metrics.unsupportedClaimCount, 0);
});

test("BL-012 benchmark is repeatable and explicitly prohibits human-usability claims", async () => {
  const first = await runResidentTaskEvaluation();
  const second = await runResidentTaskEvaluation();
  assert.deepEqual(first, second);
  assert.match(first.limitations, /not observed human behavior/i);
  assert.match(first.limitations, /must not be described as user research/i);
});
