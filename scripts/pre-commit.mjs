import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function runGate(run = spawnSync) {
  const diff = run("git", ["diff", "--quiet", "--ignore-submodules", "--"], {
    stdio: "inherit",
  });
  if (diff.error || diff.status !== 0) {
    console.error(
      "Commit blocked: stage or stash tracked working-tree changes before checking the commit.",
    );
    return 1;
  }
  const result = run("corepack", ["pnpm", "quality:commit"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error || result.status !== 0) {
    console.error(
      "Commit blocked: quality checks failed or the required toolchain is unavailable.",
    );
    return 1;
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runGate();
}
