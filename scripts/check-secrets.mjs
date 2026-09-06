import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const allowedEnvironmentFiles = new Set([".env.example"]);
const textExtensions = new Set([
  ".css",
  ".d.ts",
  ".json",
  ".js",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const secretPatterns = [
  { label: "private key", pattern: /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/ },
  { label: "GitHub token", pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { label: "OpenAI-style key", pattern: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/ },
  { label: "Vercel token", pattern: /\bvercel_[A-Za-z0-9]{20,}\b/ },
  {
    label: "private value exposed through NEXT_PUBLIC_",
    pattern: /\bNEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN|MODEL_KEY)\b/,
  },
];
const findings = [];

const candidateFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: root, encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);

for (const relativePath of candidateFiles) {
  const filename = path.basename(relativePath);
  if (filename.startsWith(".env") && !allowedEnvironmentFiles.has(filename)) {
    findings.push(`${relativePath}: disallowed environment file is within the commit candidates`);
    continue;
  }

  if (!textExtensions.has(path.extname(filename)) && !filename.startsWith(".env")) continue;

  let content;
  try {
    content = await readFile(path.join(root, relativePath), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") continue;
    throw error;
  }
  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(content)) findings.push(`${relativePath}: possible ${label}`);
  }
}

if (findings.length > 0) {
  console.error(`Secret scan failed with ${findings.length} finding(s):`);
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("Secret scan passed: no credential pattern or disallowed environment file found.");
