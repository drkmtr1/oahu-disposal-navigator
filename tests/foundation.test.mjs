import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("BL-003 / AC-NFR-012-01: package scripts and dependency versions are reproducible", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const requiredScripts = [
    "build",
    "check:secrets",
    "lint",
    "test",
    "typecheck",
    "validate:data",
  ];

  for (const script of requiredScripts) {
    assert.equal(typeof packageJson.scripts[script], "string", `missing ${script} script`);
  }

  for (const [name, version] of Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    assert.match(version, /^\d+\.\d+\.\d+$/, `${name} must use an exact version`);
  }

  assert.equal(packageJson.packageManager, "npm@10.9.2");
  assert.equal((await read(".nvmrc")).trim(), "22.17.1");
});

test("BL-003 / NFR-004 and NFR-006: the foundation page has a semantic, reflow-safe shell", async () => {
  const [layout, page, css] = await Promise.all([
    read("app/layout.tsx"),
    read("app/page.tsx"),
    read("app/globals.css"),
  ]);

  assert.match(layout, /<html lang="en">/);
  assert.match(page, /<main className="page-shell">/);
  assert.match(page, /<h1>/);
  assert.match(css, /min-width: 320px/);
  assert.match(css, /width: min\(100%, 48rem\)/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("BL-003 / NFR-008 foundation: the environment template contains names only", async () => {
  const environmentExample = await read(".env.example");

  for (const line of environmentExample.split(/\r?\n/)) {
    const candidate = line.replace(/^\s*#\s?/, "").trim();
    if (!/^[A-Z][A-Z0-9_]*=/.test(candidate)) continue;
    assert.equal(candidate.split("=", 2)[1], "", `${candidate} must not contain a value`);
  }

  assert.doesNotMatch(environmentExample, /NEXT_PUBLIC_.*(?:SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN|MODEL_KEY)/);
});

test("BL-003 / AC-NFR-012-01: CI gates every implemented validation layer", async () => {
  const workflow = await read(".github/workflows/ci.yml");

  for (const command of [
    "npm ci",
    "npm run lint",
    "npm run typecheck",
    "npm test",
    "npm run validate:data",
    "npm run check:secrets",
    "npm run build",
    "npm run audit:dependencies",
  ]) {
    assert.ok(workflow.includes(command), `CI must run ${command}`);
  }

  assert.doesNotMatch(workflow, /(?:OPENAI|ANTHROPIC|MODEL)_API_KEY/);
});

test("BL-003 / AC-NFR-013-01: the PR template requires traceability and rollback evidence", async () => {
  const template = await read(".github/pull_request_template.md");

  for (const field of [
    "Backlog item:",
    "Requirements:",
    "Acceptance criteria:",
    "Tests and results:",
    "Risks, assumptions, and unresolved debt:",
    "Rollback:",
  ]) {
    assert.ok(template.includes(field), `PR template must include ${field}`);
  }
});
