import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("BL-009 / NFR-003 and NFR-010: the recorded model fails the mandatory critical-safety gate", async () => {
  const result = JSON.parse(await read("data/evaluation/ai-value-experiment-results.json"));

  assert.equal(result.runs, 3);
  assert.equal(result.records.length, 180);
  assert.equal(result.metrics.structuralValidityPercent, 100);
  assert.equal(result.metrics.invalidOutputContainmentPercent, 100);
  assert.equal(result.metrics.unsupportedClaimCount, 0);
  assert.equal(result.metrics.criticalSafeHandlingPercent, 92.86);
  assert.ok(result.metrics.criticalSafeHandlingPercent < 100);
});

test("BL-009 / AC-FR-004-01: failed gate leaves the production application deterministic-only", async () => {
  const applicationSources = await Promise.all([
    read("app/api/disposal-options/route.ts"),
    read("lib/disposal/domain.ts"),
    read("lib/disposal/http.ts"),
    read("lib/disposal/supabase.ts"),
  ]);
  const joined = applicationSources.join("\n");

  assert.doesNotMatch(joined, /MODEL_API_KEY|api\.openai\.com|responses\.create/u);
});

test("BL-009 / NFR-007 and NFR-012: live calls stayed bounded and remain outside CI", async () => {
  const [resultText, workflow, packageJsonText] = await Promise.all([
    read("data/evaluation/ai-value-experiment-results.json"),
    read(".github/workflows/ci.yml"),
    read("package.json"),
  ]);
  const result = JSON.parse(resultText);
  const packageJson = JSON.parse(packageJsonText);

  assert.ok(result.metrics.latencyMs.p95 <= 5000);
  assert.ok(result.metrics.estimatedCostUsd <= result.budgetAuthorizedUsd);
  assert.equal(packageJson.scripts["validate:ai-experiment"], "node scripts/validate-ai-experiment-results.mjs");
  assert.equal(packageJson.scripts["evaluate:ai:live"], "node --no-warnings --experimental-strip-types scripts/run-ai-value-experiment.mjs");
  assert.ok(workflow.includes("npm run validate:ai-experiment"));
  assert.ok(!workflow.includes("npm run evaluate:ai:live"));
});
