import { createHash } from "node:crypto";

export async function checkEvidence(manifest, read) {
  const errors = [];
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const check = async (file, expected, normalize = false) => {
    if (!file || file.startsWith("/") || file.includes("..") || file.includes(":")) {
      errors.push(`Unsafe evidence path: ${file}`);
      return;
    }
    try {
      const bytes = await read(file);
      if (hash(normalize ? bytes.toString().replaceAll("\r\n", "\n") : bytes) !== expected)
        errors.push(`Changed evidence: ${file}`);
    } catch {
      errors.push(`Missing evidence: ${file}`);
    }
  };
  for (const [file, hash] of Object.entries(manifest.inputs || {})) await check(file, hash, true);
  const ids = new Set();
  for (const component of manifest.components) {
    if (ids.has(component.id)) errors.push(`Duplicate component: ${component.id}`);
    ids.add(component.id);
    if (!component.licenseFiles?.length) errors.push(`Missing license text: ${component.id}`);
    for (const file of component.licenseFiles || []) {
      if (!file.source) errors.push(`Missing provenance: ${file.path}`);
      await check(file.path, file.sha256);
    }
    if (component.sourceArchive)
      await check(component.sourceArchive.path, component.sourceArchive.sha256);
  }
  errors.push(...(manifest.gaps || []));
  return errors;
}
