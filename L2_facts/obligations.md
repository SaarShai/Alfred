---
schema_version: 2
title: Obligations and reminders
type: fact
domain: project
tier: working
confidence: 0.9
created: 2026-06-02
updated: 2026-06-02
verified: 2026-06-02
sources: [L3_sops/capture-and-route.md, patterns/daily-weekly-briefing.md]
supersedes: []
superseded-by:
tags: [obligations, reminders, deadlines, recurring, executive-assistant, daily-briefing, weekly-planning]
---

# Obligations and reminders

## Summary

Durable ledger of time-bound items the user has asked Alfred to hold: one-time
reminders, deadlines, and recurring tasks. Single source of truth across
sessions. Feeds [[patterns/daily-weekly-briefing]]. Written via
[[L3_sops/capture-and-route]] (draft-then-ask).

## Columns

- `id` — short slug, stable.
- `what` — the obligation, one line.
- `kind` — `reminder` (one-time) | `deadline` | `recurring`.
- `due / cadence` — absolute date `YYYY-MM-DD` for one-time/deadline; cadence
  phrase (e.g. `weekly Mon`, `monthly 1st`) for recurring. No relative dates.
- `status` — `open` | `done` | `snoozed:YYYY-MM-DD` | `cancelled`.
- `fire` — `passive` (briefing surfaces it) | `scheduled:<routine-id>` (a
  `/schedule` routine actually fires it).
- `source` — when/how captured: `YYYY-MM-DD` + brief context.

## Ledger

| id | what | kind | due / cadence | status | fire | source |
|---|---|---|---|---|---|---|
| order-backlog | Work through the Screenery order backlog (file prep) | recurring | ongoing | open | passive | 2026-06-26 mirror-intake; some delegated to AI agents |
| email-backlog | Answer backlog of emails (being procrastinated) | recurring | ongoing | open | passive | 2026-06-26 mirror-intake |

## Rules

- Every time-bound item the user states lands here first (passive by default).
- `/schedule` firing is added per-item only on explicit request; record its
  routine id in `fire`. `/schedule` is a GATE — confirm before creating.
- Mark `done`/`cancelled` in place; do not delete history within a session.
  Periodically archive resolved rows to keep the ledger scannable.
- Convert any relative date the user gives ("next Friday") to an absolute date
  at capture time.

## Related

- [[L3_sops/capture-and-route]]
- [[patterns/daily-weekly-briefing]]
- [[L2_facts/user-operating-profile]]
- [[L2_facts/subscriptions-tracker]]
