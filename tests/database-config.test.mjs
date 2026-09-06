import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = await readFile(new URL("../supabase/config.toml", import.meta.url), "utf8");
const schema = await readFile(
  new URL("../supabase/schemas/01_reference_data.sql", import.meta.url),
  "utf8",
);
const workflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

test("BL-004 / NFR-008 exposes only the dedicated read API schema", () => {
  assert.match(config, /^schemas = \["api"\]$/m);
  assert.match(config, /^auto_expose_new_tables = false$/m);
  assert.doesNotMatch(config, /^schemas = .*"private"/m);
});

test("BL-004 / NFR-014 keeps unused Supabase products disabled", () => {
  for (const section of ["realtime", "storage", "auth", "edge_runtime", "analytics"]) {
    assert.match(config, new RegExp(`\\[${section.replace("_", "\\_")}\\]\\r?\\nenabled = false`));
  }
});

test("AC-NFR-008-01 uses a security-invoker view and explicit read-only grants", () => {
  assert.match(schema, /create view api\.disposal_lookup\s+with \(security_invoker = true\)/i);
  assert.match(schema, /grant select on api\.disposal_lookup to anon, authenticated;/i);
  assert.doesNotMatch(schema, /grant\s+(all|insert|update|delete).*to anon/i);
  assert.doesNotMatch(schema, /security definer/i);
});

test("BL-004 / AC-NFR-012-01 gates the implemented database layer in CI", () => {
  for (const command of [
    "npm run db:verify-seed",
    "supabase start",
    "supabase db reset --local",
    "supabase db lint --local",
    "supabase test db --local",
    "supabase db schema declarative sync",
  ]) {
    assert.ok(workflow.includes(command), `CI must run ${command}`);
  }

  assert.match(workflow, /version: 2\.116\.0/);
});
