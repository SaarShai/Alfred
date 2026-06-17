---
schema_version: 2
title: Approved information sources
type: fact
domain: project
tier: semantic
confidence: 0.72
created: 2026-05-11
updated: 2026-05-12
verified: 2026-05-12
sources: [projects/executive-assistant/README.md, L3_sops/approved-source-intake.md, raw/2026-05-12-gemini-spark-google-doc.md]
supersedes: []
superseded-by:
tags: [approved-sources, access-control, executive-assistant, daily-briefing, weekly-planning]
---

# Approved information sources

## Purpose

The source registry for the chief-of-staff system, including daily briefing and weekly planning source access. The assistant may inspect external folders or document sources only after they are recorded here with an access level and off-limits notes.

## Default Policy

- Current workspace: approved for normal repo-local work.
- External folders: not approved until the user names the exact path and grants an access level.
- Account connectors, email, calendar, messaging, browser profiles, cloud drives, and broad local folder scans: not approved in v1.
- Secrets are off-limits unless the user explicitly says a secret is needed for the current task.

## Source Records

| Label | Path or source | Access level | Off-limits | Active-agent notes | Verified | Provenance |
|---|---|---|---|---|---|---|
| PROMPTER workspace | `/Users/za/Documents/PROMPTER` | admin edits for this repo | secrets not explicitly requested | current active workspace | 2026-05-11 | user request to implement chief-of-staff system; `./te doctor` ok |
| Gemini Spark Google Doc | `https://docs.google.com/document/d/1Qh8lnCaD5_4KdWKQPnLqVMtXxQVhIS0c9bTthzlXLuE` | read-only for principles ingestion and retrieval | all other Google Drive files unless explicitly named; writes/comments/deletes; broad Drive scans; secrets | single-doc source only | 2026-05-12 | user supplied title and URL; Google Drive connector `_fetch` succeeded; [[raw/2026-05-12-gemini-spark-google-doc]] |

## Access Levels

- `read-only`: inspect and summarize only.
- `task-specific edits`: edit only files required for the named task.
- `admin edits`: maintain docs/wiki/tooling inside the approved source.

## Related

- [[L3_sops/approved-source-intake]]
- [[L2_facts/source-intake-queue]]
- [[L3_sops/gogcli-workspace-access]]
- [[patterns/assistant-task-routing]]
- [[projects/executive-assistant/README]]
