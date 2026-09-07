# Product changes

## 2026-09-07 — Third-party maintenance rules for AI contributors

- Type: `maintenance`
- Added AGENTS.md requirements to update inventories and notices with dependency/resource additions, upgrades, replacements and removals.
- Require upstream rights and license/NOTICE preservation, shipped transitive/resource review, and disclosure of unresolved obligations.
- Documented existing checker limitations. Contributor rules only; no application behavior changes.

## 2026-09-07 — Replace personal-use restriction with no-sale terms

- Type: `requirement`
- Adopted Rhizome No-Sale License 1.0: personal, organizational and business use are allowed; sales, paid use licenses and paid downloads require written permission.
- Separate paid services are permitted subject to anti-circumvention terms. Third-party license rights remain unchanged.
- Updated README, bilingual terms (version 1.1) and license checks. Regression: `src/components/LegalDialog.test.tsx`.

## 2026-09-07 — Project README and personal-use license

- Type: `maintenance`
- Added README with product scope, development instructions and Chinese/English licensing explanations.
- Added bilingual Rhizome Personal Use License 1.0 for personal non-commercial use; third-party license rights remain unchanged.
- Package metadata and future native bundles reference the project license. `scripts/legal-check.mjs` checks those references.

## 2026-09-07 — Relationships in credential forms

- Type: `requirement`
- Added optional, searchable credential relationships and product/composition/environment usage locations to new and edit forms; moved the parent selector into this section.
- Existing relationships load for editing. Cancel discards changes. A single database transaction saves the credential and relationships, retaining IDs and verification metadata for unchanged links.
- Tests: `src/components/AssetLinksEditor.test.tsx`, `src-tauri/src/storage.rs` cover form drafts, direction, atomic rollback, removal and retained relationships.

## 2026-09-07 — Silent relocking

- Type: `bug`
- Timeout, hidden-window and manual locks no longer immediately open Windows Hello. The lock screen still offers manual verification; startup quick unlock remains available.
- Regression: `src/components/VaultGate.test.tsx` covers silent relocking and manual Windows Hello.

## 2026-09-07 — Configurable window close behavior

- Settings now offer exit (default) or minimize to tray. Existing settings retain exit behavior.
- The tray supports reopening the main window and explicit exit; automatic locking remains active while hidden. The preference is loaded before unlocking on restart.
- Tests cover selecting the behavior, legacy defaults, persistence and invalid settings.

## 2026-09-07 — Key file selection in the credential editor

- Added a native file picker to new and existing key-file credentials, with filename preview and removal before saving.
- Selected files use the existing Rust encrypted attachment import, including the file passphrase, expiry and 10 MB limit. Import failures keep the editor open and retain the saved asset ID for retry.
- Regression coverage: file selection, cancellation and save handoff from the editor.

## 2026-09-03 — Privacy, terms, and open-source notices

- Type: `requirement` / `compliance` / `design`
- In-app documents: added Chinese and English privacy policy and terms of use that match the local-only, single-user data flow, encrypted backups, operating-system quick unlock, deletion behavior, and security boundary.
- Settings: added a dedicated legal area with privacy, terms, and third-party license views. Documents remain readable offline, close independently from Settings, and keep their action bar visible in short windows.
- Distribution: added a third-party runtime component inventory and configured Tauri to include the notices and bilingual legal documents in native installers.
- Maintenance: added `pnpm legal:check` to the release quality gate so newly added direct runtime dependencies cannot be omitted from the component inventory or notice file.
- Release requirement: the actual publisher identity, contact method, complete transitive notices, and required license texts must be reviewed and finalized before public distribution.
- Tests: added settings-entry, document-switching, and English privacy-page regressions.

## 2026-09-03 — Product composition for technical and non-technical products

- Type: `requirement` / `design`
- Model language: renamed the user-facing “service component” concept to “product composition”. Existing database rows and relationships remain compatible and are not rewritten.
- Scope: a composition can represent a domestic or international mini program, public account, video series, online store, website, application, or technical service.
- Relationships: credentials can be linked directly to a product composition or to one of its optional deployment environments, keeping different editions and channels independent.
- Interface: updated product pages, credential usage selectors, graph nodes, confirmations, local errors, examples, and Chinese/English copy.
- Tests: added product-page terminology and localized graph-search regressions.

## 2026-09-03 — Typed credential relationships

- Type: `requirement` / `data-model`
- Model: credentials can now be linked directly with six explicit meanings: used to register, used to sign in, used for recovery, issues credential, shared account, and other link. Relationships are directional, may carry a note, and are protected by foreign keys and duplicate/self-link validation.
- Detail: a credential can create either an outgoing or incoming relationship without leaving its detail dialog, and each saved row shows the complete source → relationship → target chain.
- Graph: credential relationships appear as labeled directed edges alongside platform, product, service, and environment dependencies.
- Migration: added schema migration 2 for `asset_relations`; existing encrypted vaults upgrade in place without rewriting credential payloads.
- Tests: added storage round-trip, deletion, graph-edge, and detail-form direction regressions.

## 2026-09-03 — Chinese and English interface

- Type: `requirement` / `design`
- Language: added a saved interface-language choice for following the operating system, Simplified Chinese, or English. System mode updates when the Windows or macOS language changes.
- Coverage: navigation, credential lists and editors, product and relationship views, settings, lock and recovery flows, standard field names, generated status text, and known local errors now use the selected language.
- Compatibility: existing settings default to following the system. Stored credential names, values, custom field labels, tags, notes, platform names, and encrypted data are never translated or rewritten.
- Tests: added translation, operating-system language resolution, settings persistence and validation, old-settings compatibility, and English environment-label regressions.

## 2026-09-03 — Product review, plain-language pass, and complete desktop regression

- Type: `bugfix` / `design` / `quality`
- Language: removed decorative English section labels and replaced system-oriented terms such as downstream consumer, rotation, and vault-key wrapping with direct personal-use wording. Type-specific examples now use ordinary accounts, a personal website, a home server, and a local database rather than an AI-product scenario.
- Readability: increased base, navigation, control, table, core-field, and graph-node type sizes. Rebalanced the six credential columns so a common 1280-pixel desktop window does not show an unnecessary horizontal scrollbar, while preserving copy actions beside populated fields.
- Editor: added type-specific credential-name examples, localized common environment names, retained database and connection dropdowns, and confirmed that category creation selects its type while editing keeps the type locked.
- Graph: packed disconnected relationship groups into rows, used each group’s own credential depth, reduced fit-view whitespace, enlarged labels, and changed relationship wording to “提供/关联”. Search, node inspection, connection traversal, and full-detail navigation remain available.
- Windows Hello: an enabled quick unlock now requests verification automatically once when the lock screen opens. The manual retry button remains available after cancellation, and the native prompt continues to be owned by the Rhizome window.
- Tests: added settings, product, lock-screen, graph-packing, environment-label, terminology, and type-specific placeholder regressions. Completed browser walkthroughs for create, edit, list, detail, product, graph, settings, theme, lock, and quick-unlock flows.
- Terminology: unified the remaining user-facing Rust errors on “凭证库”, removing the last legacy “保险库” wording.

## 2026-09-02 — Context-aware asset creation

- Type: `bugfix` / `design`
- Create: using the add action from a type-filtered list now initializes the editor with that sidebar type instead of always falling back to Website Account; the all-credentials view retains Website Account as its default.
- Edit: existing credentials no longer show the asset-type tabs, preventing accidental conversion of a stored credential into another schema.
- Tests: added shell coverage for sidebar-aware creation and editor coverage for immutable types during editing.

## 2026-09-02 — Layered dependency graph routing

- Type: `bugfix` / `design`
- Layout: the graph now derives credential depth from actual platform and parent relationships, then places platform, credential chain, product, service, and environment in distinct left-to-right layers.
- Routing: every dependency uses right-side source and left-side target anchors with rounded orthogonal lanes, preventing the former top/bottom paths from folding back across nodes.
- Scale: disconnected dependency groups receive separate vertical bands, and nodes within each layer are centered to reduce crossings and unused space.
- Tests: replaced the shared-column assertion with a complete platform-to-environment layering regression.

## 2026-09-02 — Native title-bar theme synchronization

- Type: `bugfix`
- Windows: the native title bar now receives the same system, light, or dark preference as the Rhizome interface whenever settings are loaded or changed.
- System mode: clearing the native override lets Windows continue to update the title bar when the operating-system appearance changes.
- Tests: added preference mapping coverage for system, light, dark, and invalid values.

## 2026-09-02 — Categorical credential fields

- Type: `requirement` / `design`
- Editor: fixed-category metadata now uses dropdowns instead of error-prone free text, including database engine, database connection mode, deployment environment, and server operating-system family.
- Coverage: database choices include common international and Chinese engines, while each catalog retains an “Other” choice and preserves previously stored custom values.
- Tests: added editor coverage for selecting and saving database engine and connection mode.

## 2026-09-02 — One-click theme toggle

- Type: `bugfix`
- Theme: the toolbar toggle now switches directly between the effective dark and light appearances; dark mode no longer passes through the visually identical system-dark state and require a second click.
- System mode: when following Windows, the toggle resolves the current system appearance and changes to its opposite in one click. System-following remains available in Settings.
- Tests: added a shell regression covering a single-click change from dark to light.

## 2026-09-02 — Windows Hello owned prompt

- Type: `bugfix`
- Windows: Windows Hello verification now uses the desktop interop API with the active Rhizome HWND as its owner, instead of opening an unowned system window that waits behind a separate taskbar item.
- Focus: Rhizome activates its current window before requesting verification, so the operating-system prompt appears immediately in front of the lock or settings screen.
- Boundary: the verification UI remains the trusted Windows system dialog; no biometric data enters Rhizome.
- Tests: added a Windows-only API-shape regression ensuring both quick-unlock paths require an owner window handle.

## 2026-09-02 — Built-in platform suggestions

- Type: `requirement` / `design`
- Editor: the platform field now offers local, type-specific suggestions covering common Chinese and international AI, cloud, account, database, and key-file platforms.
- Consistency: recognized aliases such as `aws`, `aliyun`, `gemini`, and `kimi` normalize to canonical display names on blur and save.
- Flexibility: suggestions remain optional, so personal, self-hosted, and niche platforms can still be entered without restriction.
- Tests: added catalog and editor coverage for relevance, alias normalization, and custom-value preservation.

## 2026-09-02 — Settings footer visibility

- Type: `bugfix`
- Layout: divided the settings dialog into fixed header and footer rows with an independently scrolling body, constrained to the dynamic viewport so Close and Save Settings remain fully visible.

## 2026-09-02 — Asset expiry icon spacing

- Type: `design`
- Visual: increased the spacing between the clock icon and “长期有效” or the expiry date, and prevented the icon from shrinking in narrow time columns.

## 2026-09-02 — Copyable masked field previews in the asset list

- Type: `requirement` / `security`
- List: populated sensitive fields now appear as Rust-generated partial previews instead of the ambiguous “无非敏感字段” message; ordinary fields remain readable.
- Action: every populated core field has an inline copy button that uses the existing Rust clipboard policy and does not open the asset detail dialog.
- Security: full sensitive values are still excluded from list responses; the React list receives only masked previews and copies the original by asset and field identifiers.
- Tests: expanded storage and shell regression coverage for masked summaries, source-value exclusion, and inline copy behavior.

## 2026-09-02 — Relevant asset metadata and safe editor footer

- Type: `requirement` / `bugfix`
- Metadata: removed the user-facing “用户名索引” input; list and search metadata is now derived automatically from the type-specific username field.
- Relevance: environment is shown only for deployment-bound API credentials, servers, and databases. Saving other asset types clears obsolete environment metadata.
- Layout: constrained the editor to the dynamic viewport and made its form explicitly reserve a non-scrolling footer row so Cancel and Save remain fully visible.
- Tests: added regression coverage for automatic username indexing and type-specific environment visibility.

## 2026-09-02 — Standard fields by asset type

- Type: `requirement` / `design`
- Editor: each of the six asset types now presents a concise fixed standard field set; standard field names and sensitivity cannot be accidentally renamed, deleted, or reclassified.
- Extension: “添加自定义字段” adds a separate editable row whose label, value, sensitivity, and removal remain user-controlled.
- Compatibility: existing field keys and encrypted storage remain unchanged; older records missing a standard field can populate it without a database migration.
- Tests: added exact template-contract coverage and editor regression coverage separating standard and custom fields.

## 2026-09-02 — Product-wide credential terminology

- Type: `design`
- Language: standardized the user-facing umbrella term as “凭证”; “密钥” is reserved for concrete items such as API keys, SSH private keys, and key files.
- Coverage: replaced “秘密” across navigation, search, empty states, editor titles, project dependencies, folder confirmation, onboarding, and operation feedback without renaming internal persistence fields or commands.
- Compatibility: this is a presentation-only change and does not alter existing vault data or backup formats.

## 2026-09-02 — Searchable and inspectable dependency graph

- Type: `requirement` / `design`
- Search: added local node search across platform, credential, product, service, environment, name, and subtitle; Enter or a result click locates and focuses the matching node.
- Detail: selecting a node now opens an in-graph inspector with its type, description, upstream/downstream counts, connected nodes, and relationship labels. Connected nodes can be followed without leaving the graph.
- Navigation: the inspector can open full asset details, the owning product, or the matching platform asset list.
- Visual: increased node size and typography, localized node types, added directional edge arrows, improved dark-theme edge labels, separated the legend from the minimap, and dims unrelated nodes and edges while tracing a selection.
- Tests: added coverage for graph search and incoming/outgoing connection detail generation.

## 2026-09-02 — Detail dialog outside-click dismissal

- Type: `bugfix`
- Interaction: clicking the shaded area outside an asset detail now closes the detail dialog, while clicks inside the panel continue to interact with the asset.
- Accessibility: the dismissal target is a real labeled button behind the dialog rather than an unlabeled click handler on a static container.
- Tests: added a regression test covering outside dismissal and inside-click isolation.

## 2026-09-02 — Server-specific credentials and visible editor actions

- Type: `requirement` / `bugfix`
- Fix: the asset editor now owns the available viewport with a fixed header and action footer, so Cancel and Save remain fully visible while only the form body scrolls.
- Server model: server records now expose structured host, port, operating system, provider, username, and login-method controls instead of treating every value as an undifferentiated custom row.
- Authentication: password login stores a username and password; SSH-key login stores a username, encrypted private-key content, and an optional key passphrase. Switching methods removes the incompatible credential from the saved record.
- Search: the server login username automatically becomes the non-secret username hint used by the asset list and search.
- Tests: added template and editor regression coverage for mutually exclusive server credentials, action availability, and the saved username index.

## 2026-09-02 — Desktop experience and reliability audit

- Type: `bugfix` / `design`
- Visual: replaced the permanent detail column with a narrower on-demand side dialog, removed the duplicate top-bar search, tightened the navigation rail, modernized typography and contrast, and resized the asset table so its six core columns fit a typical desktop window without immediate horizontal scrolling.
- Visual: reused the packaged Rhizome application artwork for the in-app brand, kept platform marks bundled locally, added clearer loading/progress states, and aligned light, dark, modal, form, graph, and empty-state styling.
- Interaction: `Ctrl+K` now targets the single asset search field; filter controls close with Escape or an outside click and can be reset; details show a local-loading state immediately after row selection; long operations expose a progress line instead of appearing frozen.
- Fix: removed a self-deadlock in reveal/copy commands caused by reacquiring the vault-session mutex while it was already held. Secret-policy reads now happen before the database lock, and clipboard access happens after the database lock is released.
- Fix: sensitive fields now hide independently using the expiry returned by Rust, rather than extending every visible field with a shared hard-coded 30-second timer. The reveal duration is now configurable and validated with the other local security settings.
- Fix: graph layout now assigns service and environment nodes separate rows in their shared column and computes positions in one pass instead of repeatedly scanning the complete graph.
- Resilience: concurrent operations no longer clear the global busy state prematurely; async failures from project, folder, detail, unlock, file, and relationship actions are handled without unhandled promise rejections; Windows Hello activation shows an explicit waiting state and recovers on cancellation.
- Tooling: quality and release scripts now invoke the manifest-pinned pnpm through Corepack internally, so a different global pnpm can no longer break the verification chain after the first command.
- Accessibility: added a skip link, one semantic search entry point, explicit field names/labels, live status and error messaging, dynamic reveal labels, keyboard dismissal for filters and dialogs, and complete labels for icon-only modal actions.
- Tests: added Rust coverage for the reveal-policy deadlock and validation, frontend coverage for per-field reveal expiry, graph node separation, quick-unlock progress/recovery, filter dismissal, and the revised single-search workflow.

## 2026-09-02 — Rhizome and platform logo system

- Type: `requirement`
- Change: replaced text initials with a reusable visual identity system across asset rows, detail dialogs, and graph nodes.
- Coverage: bundled local logos recognize common AI, cloud, developer, database, and account platforms, including DeepSeek, OpenAI, Google, Alibaba Cloud, AWS, Azure, Tencent Cloud, GitHub, PostgreSQL, MySQL, MongoDB, and Redis; unknown values fall back to the asset-kind icon.
- Privacy: brand SVG data is compiled into the desktop bundle through `simple-icons`; no remote image, CDN, or runtime network request was introduced.
- Brand: added a local Rhizome key-and-root SVG mark and aligned it with the existing application icon language.
- Tests: added `src/components/PlatformLogo.test.tsx` for alias recognition, database-field recognition, and unknown-platform fallback.

## 2026-09-02 — Asset-first desktop layout and responsiveness fixes

- Type: `requirement` / `bugfix`
- Change: made the asset table the primary workspace, moved asset details into an on-demand side dialog, exposed every non-sensitive core field in list rows, increased interface type sizes, and added working sort/filter, keyboard search, detail close, and detail action-menu controls.
- Security: list responses continue to omit every field marked sensitive; passwords, tokens, secret keys, and private-key content remain available only through explicit reveal/copy commands.
- Fix: moved Windows Hello consent work off the Tauri UI thread, stopped holding the vault session lock while the system prompt is open, cached the availability probe, and made command dispatch asynchronous so database and backup work cannot block window event handling.
- Fix: all settings operations now clear their busy state in `finally`, including Windows Hello cancellation and errors, so a failed quick-unlock attempt cannot leave the dialog stuck.
- Performance: stale asset-list and detail responses are ignored, refresh work is serialized, and expensive backdrop blur was removed.
- Tooling: Tauri development/build hooks now invoke the project-pinned pnpm through Corepack instead of whichever global pnpm appears first on `PATH`.
- Tests: expanded `src/App.test.tsx` with detail-dialog/list-field coverage and a quick-unlock failure regression; expanded `src-tauri/src/storage.rs` to prove list summaries include non-sensitive fields while excluding secret values.

## 2026-09-02 — Initial personal vault vertical slice

- Type: `requirement`
- Change: initialized Rhizome as a Tauri 2 offline personal vault with encrypted storage, six long-lived asset types, project dependency mapping, graph/search UI, recovery-key backup, and light/dark themes.
- Reason: consolidate personally managed credentials and make every downstream use visible before rotation.
- Tests: `src/App.test.tsx`, `src/lib/assetTemplates.test.ts`, `src-tauri/src/crypto.rs`, `src-tauri/src/storage.rs`, `src-tauri/src/backup.rs`.

### Delivered scope notes

- Added nested personal folders, service components, deployment environments, asset-to-service/environment bindings, and product-to-secret reverse lookup.
- Kept SQLCipher memory security enabled on Windows by reserving sufficient process working-set quota before `VirtualLock` is used.
- Added master-password change, one-time recovery-key rotation, encrypted backup restore, Windows Hello-backed quick unlock, conditional clipboard clearing, and lock-on-hidden behavior.
- Expanded direct SQLCipher tests for folders, product structure, graph consistency, wrong credentials, ciphertext tampering, and backup integrity.
- Updated the Vite React plugin to the Vite 8-compatible 6.1.1 line and moved production transforms/minification to Vite 8's Oxc pipeline.
- Aligned the JavaScript/Rust Tauri dialog plugin at 2.7.3 and generated the unsigned Windows x64 NSIS installer.
- Verified `pnpm quality`, the native debug build, production dependency audit, and release artifact smoke check. RustSec advisory download remains pending because this workstation could not reach GitHub over HTTPS.
- Windows ARM64 packaging remains pending the UAC-approved installation of `Microsoft.VisualStudio.Component.VC.Tools.ARM64`; no partial installer process was left running.
