---
schema_version: 2
title: gogcli workspace access
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-gogcli-install-source.md, L2_facts/source-intake-queue.md, queries/2026-05-11-onboarding-pass-1.md]
supersedes: []
superseded-by:
tags: [gogcli, google-workspace, source-intake, executive-assistant]
---

# gogcli workspace access

## Trigger

Use when connecting Google Workspace account `saar.shai@gmail.com` through the `gog` CLI for chief-of-staff retrieval.

## Installed Tool

- Binary: `/Users/za/.local/bin/gog`
- Version: `v0.16.0`
- Config path reported by tool: `/Users/za/Library/Application Support/gogcli/config.json`
- Current status: installed, not authenticated.

## Safe Defaults

- Prefer repo-local wrapper `tools/gog-agent-readonly` for agent-side reads. It blocks sends, deletes, uploads, sharing, calendar mutations, auth writes, and unknown command paths before calling `gog`.
- Use `--gmail-no-send` unless the user explicitly asks to draft or send email.
- Use `--readonly` during initial auth where supported.
- Use `--no-input` for checks and smoke tests.
- Prefer narrow `--services` lists over `--services all`.
- Use runtime `--enable-commands`/`--disable-commands` when a task needs only a narrow command surface.
- Before routine subagent use, prefer a baked `readonly` or `agent-safe` `gog` binary so a worker cannot widen its own command permissions.
- Do not run deletes, sends, calendar changes, Drive mutations, admin actions, or broad scans without explicit user approval.

## Auth Procedure

1. User creates or provides a Google OAuth Desktop Client JSON:
   - Google Cloud Console credentials page.
   - Create Credentials -> OAuth client ID -> Desktop app -> Download JSON.
2. Store credentials:
   - `/Users/za/.local/bin/gog auth credentials set <credentials.json>`
3. Authorize narrow read-first services:
   - `/Users/za/.local/bin/gog auth add saar.shai@gmail.com --services gmail,calendar,drive,docs,sheets,tasks,people --readonly --gmail-scope readonly --drive-scope readonly --gmail-no-send`
   - `gog login <email>` is an alias for `gog auth add <email>`.
4. Verify:
   - `/Users/za/.local/bin/gog status --json --no-input`
   - `/Users/za/.local/bin/gog auth list --json --no-input`
   - `/Users/za/.local/bin/gog --account saar.shai@gmail.com --gmail-no-send --json me`
   - `tools/gog-agent-readonly status --json --no-input`
5. Promote the source from [[L2_facts/source-intake-queue]] into [[L2_facts/approved-information-sources]] only after a non-mutating verification command succeeds.

## Future Hardening

- Install Go only if the user approves building a safety-profile binary.
- Build `gog-readonly` first, then test blocked send/delete/share/admin commands before giving it to subagents.
- Keep the stock `gog` binary for human-supervised setup, and use the safety-profile binary for agent reads.
- Replace or complement `tools/gog-agent-readonly` with the baked binary once available.

## Related

- [[raw/2026-05-11-gogcli-install-source]]
- [[patterns/agent-tool-guardrails]]
- [[L2_facts/source-intake-queue]]
- [[L3_sops/approved-source-intake]]
