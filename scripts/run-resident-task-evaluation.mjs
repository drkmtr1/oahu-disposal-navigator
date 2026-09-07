import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { runEvaluation } from "./run-deterministic-evaluation.mjs";

export async function runResidentTaskEvaluation() {
  const benchmark = JSON.parse(await readFile(new URL("../data/evaluation/resident-task-cases.json", import.meta.url), "utf8"));
  const baseline = await runEvaluation();
  const selected = baseline.cases.filter((record) => benchmark.case_ids.includes(record.id));
  const successful = selected.filter((record) => record.actualDecision === "success");
  const critical = selected.filter((record) => record.criticalSafety);
  const percent = (numerator, denominator) => Number(((numerator / denominator) * 100).toFixed(2));
  const result = {
    evaluationId: benchmark.evaluation_id,
    evaluationDate: benchmark.evaluation_date,
    method: benchmark.method,
    humanParticipants: false,
    limitations: benchmark.limitations,
    caseCount: selected.length,
    metrics: {
      correctTaskOutcome: {
        correct: selected.filter((record) => record.correct).length,
        total: selected.length,
        percent: percent(selected.filter((record) => record.correct).length, selected.length),
      },
      successfulSourceAssociation: {
        associated: successful.filter((record) => record.citationAssociated).length,
        successful: successful.length,
        percent: percent(successful.filter((record) => record.citationAssociated).length, successful.length),
      },
      criticalSafeHandling: {
        safe: critical.filter((record) => record.safeCritical).length,
        critical: critical.length,
        percent: percent(critical.filter((record) => record.safeCritical).length, critical.length),
      },
      unsupportedClaimCount: selected.filter((record) => record.unsupportedClaim).length,
    },
    cases: selected.map((record) => Object.fromEntries(
      Object.entries(record).filter(([key]) => key !== "durationMs"),
    )),
  };
  if (selected.length !== benchmark.case_count) throw new Error("Resident-task case selection is incomplete");
  return result;
}

async function main() {
  const result = await runResidentTaskEvaluation();
  console.log("Resident-task benchmark completed.");
  console.log(`Cases: ${result.metrics.correctTaskOutcome.correct}/${result.metrics.correctTaskOutcome.total} correct (${result.metrics.correctTaskOutcome.percent}%)`);
  console.log(`Successful source association: ${result.metrics.successfulSourceAssociation.associated}/${result.metrics.successfulSourceAssociation.successful} (${result.metrics.successfulSourceAssociation.percent}%)`);
  console.log(`Critical safe handling: ${result.metrics.criticalSafeHandling.safe}/${result.metrics.criticalSafeHandling.critical} (${result.metrics.criticalSafeHandling.percent}%)`);
  console.log(`Unsupported claims: ${result.metrics.unsupportedClaimCount}`);
  console.log("Limitation: non-participant benchmark; no observed-human-usability claim.");
  const failed =
    result.metrics.correctTaskOutcome.percent < 80 ||
    result.metrics.successfulSourceAssociation.percent !== 100 ||
    result.metrics.criticalSafeHandling.percent !== 100 ||
    result.metrics.unsupportedClaimCount !== 0;
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
