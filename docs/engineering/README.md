# Engineering guide

## Toolchain

- Node 24.18.0 and pnpm 11.24.0.
- Rust 1.98.0, installed under `D:\DevTools` on the Windows workstation.
- Visual C++ Build Tools and Windows SDK for native packaging.

Restart the terminal after the first tool installation so user-level `CARGO_HOME`, `RUSTUP_HOME`, `COREPACK_HOME`, `PNPM_HOME`, and `PATH` changes are visible.

## Commands

- `pnpm install` — frozen dependency setup after the lockfile exists.
- `pnpm tauri dev` — desktop development.
- `pnpm test` / `pnpm test:rust` — frontend and Rust tests.
- `pnpm quality` — initialization and ordinary repository baseline.
- `pnpm deploy:preflight` — debug native build without an installer bundle.
- `pnpm tauri build` — local native package.

## Commit quality gate

`pnpm install` installs `.githooks/pre-commit` through `prepare`. Existing checkouts and installs using `--ignore-scripts` can enable it with `corepack pnpm hooks:install`. Source archives without Git metadata skip installation. Custom `core.hooksPath` settings are preserved and require manual integration.

Every commit runs `pnpm quality:commit`: hook regression tests, frontend formatting/lint/types/tests, Rust formatting/Clippy/tests (including migrations), contracts, legal inventory and change records. Any failure or missing tool blocks the commit. No network audit or release packaging runs. The Git client needs Node, Corepack and the Rust/native toolchain on its PATH.

Checks use the working tree. Tracked unstaged edits block the commit; stage or stash them yourself first. The hook never stages or stashes files. Untracked files follow normal checker discovery rules. The separate `Rhizome-Ark` submodule is outside this gate. Local hooks can be bypassed using Git options and are not server-side enforcement. Run `pnpm test:hooks` for isolated regression tests; reserve `pnpm quality` for initialization or release checks.

## Data changes

Add numbered SQL files under `src-tauri/migrations`, include them in the migration registry, test empty and current vault upgrades, and document the change in `docs/changes.md`. Never edit an already released migration.

## Windows development paths

- Rustup: `D:\DevTools\rustup`
- Cargo and registry cache: `D:\DevTools\cargo`
- pnpm home/store: `D:\DevTools\pnpm`, `D:\DevTools\pnpm-store`
- Visual Studio Build Tools: `D:\DevTools\MicrosoftVisualStudio\2022\BuildTools`
- Strawberry Perl used by vendored OpenSSL: `D:\DevTools\StrawberryPerl`

SQLCipher `cipher_memory_security` remains enabled. Windows limits `VirtualLock` by the process minimum working set, so the native shell reserves a bounded 64–512 MiB working-set range before opening an encrypted database. Secret values additionally use short-lived Rust objects plus `Zeroizing` cleanup.

## Security rules

Use fake test secrets only. Do not print command arguments, payload JSON, database keys, recovery codes, clipboard content, or decrypted attachments. Treat frontend error strings as user-visible and redact provider details.
