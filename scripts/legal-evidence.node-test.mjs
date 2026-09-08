import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { checkEvidence } from "./legal-evidence.mjs";

const hash = (text) => createHash("sha256").update(text).digest("hex");
const manifest = {
  inputs: { "pnpm-lock.yaml": hash("lock") },
  components: [
    {
      id: "npm/example@1",
      licenseFiles: [
        {
          path: "docs/legal/example.txt",
          source: "https://example.invalid/LICENSE",
          sha256: hash("original"),
        },
      ],
    },
  ],
};
test("detects stale lockfiles and missing or changed upstream license texts", async () => {
  const files = { "pnpm-lock.yaml": "lock", "docs/legal/example.txt": "original" };
  const read = async (file) => {
    if (!(file in files)) throw new Error("missing");
    return files[file];
  };
  assert.deepEqual(await checkEvidence(manifest, read), []);
  files["pnpm-lock.yaml"] = "new dependency";
  files["docs/legal/example.txt"] = "modified";
  assert.equal((await checkEvidence(manifest, read)).length, 2);
  delete files["docs/legal/example.txt"];
  assert.ok(
    (await checkEvidence(manifest, read)).some((error) => error.startsWith("Missing evidence:")),
  );
});
