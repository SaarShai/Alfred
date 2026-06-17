---
schema_version: 2
title: Capture and route
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-06-02
updated: 2026-06-02
verified: 2026-06-02
sources: [patterns/assistant-task-routing.md, skills/wiki-write/SKILL.md, skills/executive-assistant/SKILL.md, L2_facts/user-operating-profile.md, L2_facts/obligations.md]
supersedes: []
superseded-by:
tags: [capture, routing, memory, reminders, obligations, executive-assistant]
---

# Capture and route

## Summary

When the user tells Alfred something durable, classify it and route it to one
home. Single source of truth per fact. Draft-then-ask before writing. The only
new lane vs the prior system is **time-bound obligations** (reminders, deadlines,
recurring tasks) → [[L2_facts/obligations]] + (later, on request) `/schedule`.

## Capture reflex

Cues that trigger this SOP — no command required:
`remember`, `note this`, `FYI`, `for the record`, `from now on`, `always / never`,
`my preference is`, `remind me`, `every <cadence>`, `by <date>`, `deadline`,
`I decided`, `here's a source / folder / doc`, `this person`.

Plus any unprompted statement of a durable fact, preference, decision, source,
or obligation.

## Route table

| What the user told me | Home | Notes |
|---|---|---|
| How I should work / a correction | [[L2_facts/user-operating-profile]] | also worth a host auto-memory `feedback` entry; include the why |
| Who the user is / role / context | [[L2_facts/user-operating-profile]] | identity/role facts; auto-memory `user` |
| Personal taste / list (films, books, etc.) | [[L2_facts/user-lists]] | personal-CEO scope, never the work profile |
| A durable verified fact / technique | `concepts/` or `L2_facts/` | one idea per page |
| A reusable workflow / recipe | `patterns/` → crystallize repeated wins to `L3_sops/` | |
| Project goal / constraint / state | `projects/<name>/` | |
| A person (collaborator, author) | `people/` | |
| External folder/doc to tap | [[L2_facts/approved-information-sources]] | via [[L3_sops/approved-source-intake]]; pending → [[L2_facts/source-intake-queue]] |
| A raw document / dump / paste | `raw/YYYY-MM-DD-slug.md` | immutable; never rewrite |
| An answer worth keeping | `queries/YYYY-MM-DD-slug.md` | |
| A life principle | `Principles/` | synthesized; verbatim source stays in `raw/` |
| **Reminder / deadline / recurring task** | **[[L2_facts/obligations]]** | **time lane — see below** |
| Recurring subscription / cost | [[L2_facts/subscriptions-tracker]] | |
| This-conversation-only | nothing | ephemeral; do not persist |

When two homes fit, prefer updating the richest existing page over creating a
thin new one (cf. [[skills/wiki-write/SKILL]]).

## Time lane (reminders / deadlines / recurring)

Every time-bound item lands in [[L2_facts/obligations]] first — that ledger is
the durable source of truth that survives sessions and feeds
[[patterns/daily-weekly-briefing]] ("what needs my attention").

- **Passive (default):** ledger row only. Surfaced when the user runs a briefing
  or asks what's due. No cron, no external automation, no setup.
- **Active (on request, case-by-case):** when an item must actually fire on its
  date/cadence, additionally create a `/schedule` routine (one-time for a dated
  reminder, cron for recurring). `/schedule` is a **GATE** per
  [[L3_sops/gstack-alfred-precedence]] — draft the routine, confirm with the
  user, then create it. Record the routine id in the ledger row's `fire` column
  so ledger ↔ schedule stay linked.

Decision logged 2026-06-02: build the ledger lane now; add `/schedule` firing
only when a specific reminder warrants it.

## Protocol (draft-then-ask)

1. Detect the capture cue.
2. Retrieve: `./te wiki search "<topic>"` — find the existing home before making one.
3. Classify against the route table. Time-bound → time lane.
4. **Draft:** state the destination page/path, the exact line/row to write, and
   for obligations the due/cadence + passive-or-active. One compact proposal.
5. **Ask:** wait for user confirmation. (Per [[skills/executive-assistant/SKILL]]
   operating rules — confirm before durable preference/decision writes.)
6. Write: update the page or `./te wiki new --template page` if none fits.
7. Provenance + backlinks (≥2 wikilinks where useful).
8. Append `log.md`; run `./te wiki index`; new v2 pages → `./te wiki lint --strict`.

## Rules

- One fact, one home — no duplicate authoritative copies; supersede, don't fork.
- Draft-then-ask before any durable write; no durable memory from unexecuted plans.
- Personal context (taste, lists, principles, obligations) is in-scope for
  Alfred-as-personal-CEO but only in dedicated pages, never the work profile.
- Time-bound item → ledger always; `/schedule` only when separately requested.
- Ephemeral / this-turn-only context is not persisted.
- `raw/` is append-only; never rewrite a source.

## Related

- [[patterns/assistant-task-routing]]
- [[L2_facts/obligations]]
- [[skills/wiki-write/SKILL]]
- [[skills/executive-assistant/SKILL]]
- [[patterns/daily-weekly-briefing]]
- [[L3_sops/gstack-alfred-precedence]]
- [[L2_facts/user-operating-profile]]
