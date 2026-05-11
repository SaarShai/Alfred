---
schema_version: 2
title: Source intake queue
type: fact
domain: project
tier: working
confidence: 0.6
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [L3_sops/approved-source-intake.md, L3_sops/chief-of-staff-onboarding.md]
supersedes: []
superseded-by:
tags: [source-intake, approved-sources, executive-assistant, google-workspace]
---

# Source intake queue

## Purpose

Candidate folders, docs, and account-backed sources that may become chief-of-staff inputs after explicit intake and verification.

## Queue

| Candidate source | Requested use | Current status | Required next step | Off-limits until approved | Provenance |
|---|---|---|---|---|---|
| Google Workspace account `saar.shai@gmail.com` via `gog` CLI | Workspace-backed chief-of-staff context for Gmail, Calendar, Drive, Docs, Sheets, and related briefing inputs | `gog` installed at `/Users/za/.local/bin/gog`; repo-local read-only wrapper at `tools/gog-agent-readonly`; auth pending OAuth client credentials | Provide/store Desktop OAuth client JSON, authorize narrow read-first services, run non-mutating verification through stock `gog` and wrapper | sending email, deleting/moving files, calendar changes, admin actions, broad scans, secrets | user request on 2026-05-11; [[raw/2026-05-11-gogcli-install-source]] |

## Promotion Rule

Move a source from this queue into [[L2_facts/approved-information-sources]] only after:

- the source identifier is confirmed
- access level is known
- off-limits notes are recorded
- local/tool instructions are read
- a non-mutating verification command succeeds

## Related

- [[L3_sops/approved-source-intake]]
- [[L3_sops/chief-of-staff-onboarding]]
- [[L3_sops/gogcli-workspace-access]]
- [[L2_facts/approved-information-sources]]
