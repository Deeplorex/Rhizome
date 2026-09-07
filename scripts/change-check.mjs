import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const changeFile = resolve("docs/changes.md");
if (!existsSync(changeFile)) {
  throw new Error("docs/changes.md is required");
}

const content = readFileSync(changeFile, "utf8");
const citedTests = [...content.matchAll(/`([^`]+(?:test|tests|\.rs)[^`]*)`/g)].map(
  ([, path]) => path,
);

if (!/Type: `(requirement|optimization|bug|maintenance)`/.test(content)) {
  throw new Error("The latest change entry must declare a supported Type");
}
if (citedTests.length === 0 || !citedTests.some((path) => existsSync(resolve(path)))) {
  throw new Error("A behavior change must cite at least one existing affected test");
}

console.log(`change record ok (${citedTests.length} cited test paths)`);
