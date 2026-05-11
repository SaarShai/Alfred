---
schema_version: 2
title: Chief-of-staff onboarding
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [projects/executive-assistant/README.md, L2_facts/user-operating-profile.md, L2_facts/source-intake-queue.md]
supersedes: []
superseded-by:
tags: [chief-of-staff, onboarding, executive-assistant, preferences]
---

# Chief-of-staff onboarding

## Trigger

Use when preparing the chief-of-staff system, starting first-run setup, tuning the assistant to the user, or running an onboarding check-in.

## Procedure

1. Load [[templates/chief-of-staff-onboarding.template]].
2. Ask for only missing answers that materially improve daily execution:
   - priorities
   - communication style
   - decision preferences
   - recurring constraints
   - source candidates
   - off-limits topics or actions
3. Convert confirmed work preferences into [[L2_facts/user-operating-profile]].
4. Convert source candidates into [[L2_facts/source-intake-queue]].
5. Move a queued source into [[L2_facts/approved-information-sources]] only after source intake succeeds.
6. Run a dry briefing using [[patterns/first-briefing-dry-run]].

## Memory Rules

- Store work preferences only.
- Do not infer private personal history from casual comments.
- Record provenance for every durable preference or source.
- Keep account access, sends, deletes, admin actions, broad scans, and automations behind explicit decision gates.

## Output

Return:

- Captured preferences.
- Missing preferences.
- Queued sources.
- Approved sources.
- Off-limits notes.
- Suggested first dry run.

## Related

- [[templates/chief-of-staff-onboarding.template]]
- [[patterns/structured-check-ins]]
- [[patterns/first-briefing-dry-run]]
- [[L2_facts/user-operating-profile]]
- [[L2_facts/source-intake-queue]]
- [[L2_facts/approved-information-sources]]
