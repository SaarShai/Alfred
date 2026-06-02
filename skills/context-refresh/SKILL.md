---
name: context-refresh
description: DEPRECATED — use the handoff skill (+ context-keeper for compaction). Do not use.
deprecated: true
---

# context-refresh (retired)

Superseded by **[`handoff`](../../.claude/skills/handoff/SKILL.md)** (`/handoff`, `/handoff --full`, `/handoff --ask`) for session continuity, and **[`context-keeper`](../../projects/context-keeper/SKILL.md)** (PreCompact hook) for compaction-time state preservation.

`summ` / 20%-fill refresh: use the host-native clear/compact, then a fresh session reads the handoff doc + `start.md` only. Manual prompts still live in `prompts/manual-summ-document-and-handoff.md` and `prompts/manual-fresh-session-from-handoff.md`.

Folder kept only to preserve history; no longer loaded by `start.md`.
