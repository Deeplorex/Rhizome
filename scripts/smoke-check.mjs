import { existsSync } from "node:fs";

const required = [
  "dist/index.html",
  "src-tauri/tauri.conf.json",
  "src-tauri/capabilities/default.json",
];
const missing = required.filter((path) => !existsSync(path));
if (missing.length > 0) {
  throw new Error(`Missing build artifacts/configuration: ${missing.join(", ")}`);
}
console.log("Rhizome build artifacts are present");
