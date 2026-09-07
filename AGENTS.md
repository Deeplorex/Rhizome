# Rhizome engineering rules

- `docs/product/README.md` is the product authority; `.project/standard-project.json` is the architecture authority.
- Preserve the single-user, offline-only, encrypted-local-vault boundary. Do not add cloud sync, telemetry, remote assets, browser autofill, servers, workers, queues, or team features without explicit approval.
- Rust owns secrets, persistence, cryptography, backup, clipboard, and platform integration. The React bundle must never contain database access, vault keys, or persistent secret state.
- Every behavior change updates `docs/changes.md` and a directly affected test. Bugs require a regression test.
- Use migrations for schema changes. Never log secret payloads or use real credentials in fixtures.
- Run the narrowest affected test during routine work. Run `pnpm quality` once for initialization or a release boundary.
- Do not stage, commit, push, sign, publish, or deploy without explicit authorization.

