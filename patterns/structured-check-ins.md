---
schema_version: 2
title: Structured check-ins
type: pattern
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [L2_facts/user-operating-profile.md, projects/executive-assistant/README.md]
supersedes: []
superseded-by:
tags: [check-ins, preferences, listening, executive-assistant]
---

# Structured check-ins

## When to Use

Use when the user says "remember this preference," "what should you know about me," "let's check in," "capture this decision," or when a briefing needs fresh priorities.

## Check-In Types

Priority check-in:

- What matters most right now?
- What should be ignored or deferred?
- What deadline or cadence matters?

Preference check-in:

- What preference should be remembered?
- Does it apply globally, to this workspace, or only to one workflow?
- What evidence would change it?

Decision check-in:

- What decision was made?
- Why was it made?
- What alternatives were rejected?
- When should it be revisited?

Follow-up check-in:

- Who owns the next action?
- What is the next visible step?
- When should it resurface?
- What source proves it?

## Memory Rule

Store only confirmed work preferences and decisions. Use [[L2_facts/user-operating-profile]] for durable preferences and `log.md` for timeline notes. Do not infer private personal facts from casual conversation.

## Output

Use [[templates/structured-check-in.template]] for check-in packets.

## Related

- [[L2_facts/user-operating-profile]]
- [[patterns/daily-weekly-briefing]]
- [[concepts/user-sovereignty-and-decision-gates]]
