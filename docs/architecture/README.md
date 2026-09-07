# Architecture

```text
React desktop UI
    │ typed Tauri commands
    ▼
Rust application core
    ├── vault session and cryptographic envelopes
    ├── asset/project/relation domain services
    ├── SQLCipher repository and migrations
    ├── encrypted backup/restore
    └── clipboard and OS quick-unlock adapters
             │
             ▼
        local Vault directory
```

The React process receives metadata and only receives plaintext after an explicit reveal action. Rust owns the unlocked database connection and in-memory vault key. No network capability or external service exists.

Tauri commands are asynchronous at the IPC boundary so SQLCipher, backup, and operating-system consent work cannot block the desktop window event loop. Windows Hello consent runs on a blocking worker without retaining the vault session mutex.

## Vault layout

- `vault.db`: SQLCipher database, including attachment BLOBs and FTS5 indexes.
- `key-envelope.json`: versioned password and recovery wrappers for the random database key.
- `settings.json`: non-sensitive vault preferences.
- `system-key.bin`: optional OS-user-bound quick-unlock wrapper.

The database key is random. Argon2id derives a wrapping key from the password or recovery code; XChaCha20-Poly1305 wraps the database key. Password changes therefore rewrap rather than re-encrypt the full database.

Credential dependencies use a separate `asset_relations` table rather than being embedded in encrypted payload JSON. Source and target assets are protected by cascading foreign keys; the relation type is constrained to the supported directional vocabulary, so detail and graph queries share the same source of truth.

## Dependency rule

UI → command gateway → domain/storage/platform. Storage and platform adapters may depend on domain DTOs; domain logic must not depend on React, Tauri window state, or operating-system UI.
