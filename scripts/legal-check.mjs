import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFile(resolve(root, path), "utf8");
const packageJson = JSON.parse(await read("package.json"));
const manifest = JSON.parse(await read("src/legal/third-party-components.json"));
const cargoToml = await read("src-tauri/Cargo.toml");
const notices = await read("THIRD-PARTY-NOTICES.md");

const errors = [];
const components = manifest.components ?? [];
const byEcosystem = (ecosystem) =>
  new Set(components.filter((item) => item.ecosystem === ecosystem).map((item) => item.name));

const npmManifest = byEcosystem("npm");
for (const name of Object.keys(packageJson.dependencies ?? {})) {
  if (!npmManifest.has(name)) errors.push(`Missing npm runtime component: ${name}`);
}

let cargoSection = "";
const cargoRuntime = new Set();
for (const rawLine of cargoToml.split(/\r?\n/)) {
  const line = rawLine.trim();
  const sectionMatch = line.match(/^\[(.+)]$/);
  if (sectionMatch) {
    cargoSection = sectionMatch[1];
    continue;
  }
  const isRuntimeSection =
    cargoSection === "dependencies" || /^target\..+\.dependencies$/.test(cargoSection);
  if (!isRuntimeSection || line.startsWith("#")) continue;
  const dependencyMatch = line.match(/^([A-Za-z0-9_-]+)\s*=/);
  if (dependencyMatch) cargoRuntime.add(dependencyMatch[1]);
}

const cargoManifest = byEcosystem("cargo");
for (const name of cargoRuntime) {
  if (!cargoManifest.has(name)) errors.push(`Missing Cargo runtime component: ${name}`);
}

for (const component of components) {
  for (const property of ["name", "version", "license", "ecosystem", "homepage"]) {
    if (!component[property])
      errors.push(`Component is missing ${property}: ${component.name ?? "?"}`);
  }
  if (!notices.includes(`| ${component.name} |`)) {
    errors.push(`THIRD-PARTY-NOTICES.md is missing: ${component.name}`);
  }
}

const legalDocuments = [
  "docs/legal/privacy-policy.zh-CN.md",
  "docs/legal/privacy-policy.en-US.md",
  "docs/legal/terms-of-use.zh-CN.md",
  "docs/legal/terms-of-use.en-US.md",
];
for (const path of legalDocuments) {
  const document = await read(path);
  if (!document.startsWith("# ") || !document.includes("2026")) {
    errors.push(`Legal document is incomplete: ${path}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Legal inventory check passed (${components.length} runtime components).`);
}
