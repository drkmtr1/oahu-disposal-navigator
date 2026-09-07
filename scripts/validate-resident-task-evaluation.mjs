import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const benchmark = JSON.parse(await readFile(new URL("data/evaluation/resident-task-cases.json", root), "utf8"));
const baseline = JSON.parse(await readFile(new URL("data/evaluation/deterministic-baseline-cases.json", root), "utf8"));
const errors = [];
const decisions = new Map(baseline.cases.map((record) => [record.id, record.expected.decision]));

if (benchmark.schema_version !== "1.0.0") errors.push("schema_version must be 1.0.0");
if (benchmark.status !== "approved") errors.push("status must be approved");
if (benchmark.human_participants !== false) errors.push("human_participants must be false");
if (typeof benchmark.limitations !== "string" || benchmark.limitations.length < 80) errors.push("limitations must explicitly bound claims");
if (!Array.isArray(benchmark.case_ids) || benchmark.case_ids.length !== 20 || benchmark.case_count !== 20) errors.push("exactly 20 cases are required");
if (new Set(benchmark.case_ids).size !== benchmark.case_ids.length) errors.push("case IDs must be unique");

const counts = {};
for (const id of benchmark.case_ids) {
  const decision = decisions.get(id);
  if (!decision) errors.push(`unknown frozen case ID: ${id}`);
  else counts[decision] = (counts[decision] ?? 0) + 1;
}
if (JSON.stringify(counts) !== JSON.stringify(benchmark.required_state_counts)) errors.push("required_state_counts do not match the selected frozen cases");
if (benchmark.gates?.correct_task_outcome_percent_minimum !== 80) errors.push("task-outcome gate must remain 80%");
if (benchmark.gates?.successful_source_association_percent_minimum !== 100) errors.push("source association gate must remain 100%");
if (benchmark.gates?.critical_safe_handling_percent_minimum !== 100) errors.push("critical safety gate must remain 100%");
if (benchmark.gates?.unsupported_claim_count_maximum !== 0) errors.push("unsupported-claim maximum must remain zero");
if (!Array.isArray(benchmark.browser_evidence) || benchmark.browser_evidence.length !== 5) errors.push("five browser evidence obligations are required");

if (errors.length) {
  console.error(`Resident-task evaluation validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}
console.log("Resident-task evaluation validation passed.");
console.log(`Cases: ${benchmark.case_count}; no human participants or personal data.`);
