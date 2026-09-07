# Open-source compliance

Rhizome records every directly bundled runtime dependency in `src/legal/third-party-components.json` and exposes that inventory in the application. `THIRD-PARTY-NOTICES.md` is included in native release bundles.

For every dependency change:

1. Confirm the exact locked version, SPDX license expression, upstream project, copyright notice, and redistribution conditions.
2. Update `src/legal/third-party-components.json` and `THIRD-PARTY-NOTICES.md` in the same change.
3. Preserve any required license text, copyright notice, attribution, source offer, or modification notice in the release artifact.
4. Do not add copyleft, source-available, non-commercial, or custom-licensed runtime code without a release-specific legal review.
5. Run `pnpm legal:check` before packaging. Treat the script as an inventory guard, not as legal advice or a substitute for reviewing transitive dependencies.

Platform names and logos are identifiers for user-entered services. Their trademarks remain with their owners and their presence does not imply affiliation or endorsement.
