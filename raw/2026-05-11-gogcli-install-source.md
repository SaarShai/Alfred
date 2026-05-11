---
schema_version: 2
title: gogcli install source summary
type: source-summary
domain: external-source
tier: episodic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [https://gogcli.sh, https://gogcli.sh/install.html, https://gogcli.sh/quickstart.html, https://github.com/openclaw/gogcli/releases/tag/v0.16.0]
supersedes: []
superseded-by:
tags: [source-summary, gogcli, google-workspace, executive-assistant]
---

# gogcli install source summary

## Source

- Site: https://gogcli.sh
- Install docs: https://gogcli.sh/install.html
- Quickstart docs: https://gogcli.sh/quickstart.html
- Release installed: https://github.com/openclaw/gogcli/releases/tag/v0.16.0

## Verified Install

- Platform: Darwin arm64.
- Installed binary: `/Users/za/.local/bin/gog`.
- Version: `v0.16.0 (280eea7 2026-05-10T15:28:26Z)`.
- Asset: `gogcli_0.16.0_darwin_arm64.tar.gz`.
- Checksum verified: `8d16cfa777c713377b58baec71f6ec7f68ac17baf93724c885cb5f02eac93797`.
- Homebrew was not available on this machine, so the GitHub release tarball was used.

## Auth Status

- `gog status --json --no-input` reports no config file and no stored credentials.
- `gog auth list --json --no-input` reports no accounts.
- Attempted non-interactive remote login for `saar.shai@gmail.com` failed because OAuth client credentials are missing.
- Required next step from the CLI: create/download a Google OAuth Client ID JSON for a Desktop app, then store it with `gog auth credentials set <credentials.json>`.

## Adoption Rationale

- Useful as an optional account-backed source for the chief-of-staff workspace.
- Keep behind [[L2_facts/source-intake-queue]] until OAuth credentials and service scopes are explicit.
- Use read-only scopes where possible and `--gmail-no-send` by default.

## Related

- [[L3_sops/gogcli-workspace-access]]
- [[L2_facts/source-intake-queue]]
- [[L2_facts/approved-information-sources]]
