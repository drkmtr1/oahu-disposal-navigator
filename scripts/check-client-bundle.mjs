import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const bundleRoot = path.join(process.cwd(), ".next", "static");
const forbiddenNames = [
  "MODEL_API_KEY",
  "OPENAI_API_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
];
const configuredSecretValues = [
  process.env.MODEL_API_KEY,
  process.env.OPENAI_API_KEY,
  process.env.SUPABASE_SECRET_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
].filter((value) => typeof value === "string" && value.length >= 12);
const findings = [];

for (const file of await walk(bundleRoot)) {
  if (!/\.(?:js|json|map|txt)$/.test(file)) continue;
  const content = await readFile(file, "utf8");
  for (const name of forbiddenNames) {
    if (content.includes(name)) findings.push(`${path.relative(process.cwd(), file)}: ${name}`);
  }
  for (const value of configuredSecretValues) {
    if (content.includes(value)) findings.push(`${path.relative(process.cwd(), file)}: configured secret value`);
  }
}

if (findings.length > 0) {
  console.error("Client bundle scan failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("Client bundle scan passed: no server credential name or configured secret value found.");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}
