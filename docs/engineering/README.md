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
