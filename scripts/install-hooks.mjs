import { spawnSync } from "node:child_process";
import { chmodSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
if (!existsSync(new URL("../.git", import.meta.url))) {
  console.log("Git metadata absent; skipping hook installation.");
} else {
  const current = spawnSync("git", ["config", "--get", "core.hooksPath"], {
    cwd: root,
    encoding: "utf8",
  });
  if (current.error || ![0, 1].includes(current.status)) {
    throw new Error("Cannot read Git hook configuration.");
  }
  if (current.status === 0 && current.stdout.trim() !== ".githooks") {
    throw new Error("Existing core.hooksPath detected; integrate .githooks/pre-commit manually.");
  }
  chmodSync(new URL("../.githooks/pre-commit", import.meta.url), 0o755);
  const result = spawnSync("git", ["config", "--local", "core.hooksPath", ".githooks"], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.error || result.status !== 0) throw new Error("Cannot install Git quality gate.");
  console.log("Git pre-commit quality gate installed.");
}
