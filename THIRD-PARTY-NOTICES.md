# Rhizome third-party notices

This file covers the principal runtime components directly bundled with Rhizome 0.1.0. Copyright and trademark rights remain with the respective owners. The listed upstream pages provide the corresponding license texts and project notices. A component's inclusion does not imply endorsement of Rhizome.

## JavaScript interface

| Component | Version | License | Upstream |
| --- | --- | --- | --- |
| @tauri-apps/api | 2.11.1 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri |
| @tauri-apps/plugin-dialog | 2.7.3 | MIT OR Apache-2.0 | https://github.com/tauri-apps/plugins-workspace |
| @xyflow/react | 12.11.5 | MIT | https://github.com/xyflow/xyflow |
| lucide-react | 0.544.0 | ISC | https://lucide.dev |
| react | 19.2.8 | MIT | https://react.dev |
| react-dom | 19.2.8 | MIT | https://react.dev |
| simple-icons | 16.29.0 | CC0-1.0 | https://simpleicons.org |

## Rust local core

| Component | Version | License | Upstream |
| --- | --- | --- | --- |
| arboard | 3.6.1 | MIT OR Apache-2.0 | https://github.com/1Password/arboard |
| argon2 | 0.5.3 | MIT OR Apache-2.0 | https://github.com/RustCrypto/password-hashes |
| base64 | 0.22.1 | MIT OR Apache-2.0 | https://github.com/marshallpierce/rust-base64 |
| chacha20poly1305 | 0.10.1 | Apache-2.0 OR MIT | https://github.com/RustCrypto/AEADs |
| chrono | 0.4.45 | MIT OR Apache-2.0 | https://github.com/chronotope/chrono |
| getrandom | 0.3.4 | MIT OR Apache-2.0 | https://github.com/rust-random/getrandom |
| hex | 0.4.3 | MIT OR Apache-2.0 | https://github.com/KokaKiwi/rust-hex |
| parking_lot | 0.12.5 | MIT OR Apache-2.0 | https://github.com/Amanieu/parking_lot |
| rusqlite | 0.40.2 | MIT | https://github.com/rusqlite/rusqlite |
| secrecy | 0.10.3 | Apache-2.0 OR MIT | https://github.com/iqlusioninc/crates |
| serde | 1.0.229 | MIT OR Apache-2.0 | https://github.com/serde-rs/serde |
| serde_json | 1.0.151 | MIT OR Apache-2.0 | https://github.com/serde-rs/json |
| sha2 | 0.10.9 | MIT OR Apache-2.0 | https://github.com/RustCrypto/hashes |
| tauri | 2.11.5 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri |
| tauri-plugin-dialog | 2.7.3 | Apache-2.0 OR MIT | https://github.com/tauri-apps/plugins-workspace |
| thiserror | 2.0.20 | MIT OR Apache-2.0 | https://github.com/dtolnay/thiserror |
| uuid | 1.26.0 | Apache-2.0 OR MIT | https://github.com/uuid-rs/uuid |
| windows | 0.62.2 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs |
| windows-future | 0.3.2 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs |
| zeroize | 1.9.0 | Apache-2.0 OR MIT | https://github.com/RustCrypto/utils |
| zip | 4.6.1 | MIT | https://github.com/zip-rs/zip2 |

## Bundled native software

| Component | Version | License | Upstream |
| --- | --- | --- | --- |
| SQLCipher | bundled by libsqlite3-sys 0.38.2 | BSD-3-Clause | https://github.com/sqlcipher/sqlcipher |
| SQLite | 3.51.3 | Public Domain | https://sqlite.org |
| OpenSSL | 3.6.3 | Apache-2.0 | https://openssl-library.org |
| Rust standard library | 1.98 | MIT OR Apache-2.0 | https://github.com/rust-lang/rust |

The authoritative dependency graph is recorded by `pnpm-lock.yaml` and `src-tauri/Cargo.lock`. Those files include transitive packages beyond this human-readable direct-component inventory. Before a public release, the publisher must generate and review a complete transitive notice bundle, preserving every required copyright notice, license text, attribution, and source obligation.

Simple Icons supplies brand icons under CC0-1.0; the names and logos themselves may be protected trademarks of their respective owners.
