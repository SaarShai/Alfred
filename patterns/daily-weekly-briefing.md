---
schema_version: 2
title: Daily and weekly briefing
type: pattern
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [projects/executive-assistant/README.md, L3_sops/chief-of-staff-workflow.md, L2_facts/user-operating-profile.md]
supersedes: []
superseded-by:
tags: [briefing, weekly-planning, daily-planning, executive-assistant]
---

# Daily and weekly briefing

## When to Use

Use when the user asks for a daily briefing, weekly planning, "what needs my attention," "plan my week," or a chief-of-staff status pass.

## Source Order

1. Current workspace and repo-local wiki.
2. [[L2_facts/user-operating-profile]].
3. [[L2_facts/approved-information-sources]].
4. User-provided notes in the current prompt.
5. Subagent results from [[L3_sops/subagent-dispatch-for-chief-of-staff]] when the task justifies delegation.
6. Source candidates in [[L2_facts/source-intake-queue]] only as missing-source notes, not as readable sources.

Do not read unapproved external folders or connect accounts.

## Manual-First Flow

1. Clarify time horizon if missing: today, this week, or a named period.
2. Retrieve relevant wiki context.
3. Gather active priorities, decisions, blockers, follow-ups, and risks from approved sources only.
4. Launch subagents only for bounded extraction, research, review, or documentation work.
5. Synthesize the briefing locally.
6. Ask before external actions, destructive actions, or committing to a plan on the user's behalf.

## Briefing Sections

- Situation.
- Top priorities.
- Decisions needed.
- Blockers and risks.
- Follow-ups.
- Delegated work.
- Recommended next actions.

## Output

Use [[templates/daily-weekly-briefing.template]].

## Related

- [[L3_sops/chief-of-staff-workflow]]
- [[patterns/structured-check-ins]]
- [[patterns/first-briefing-dry-run]]
- [[L2_facts/approved-information-sources]]
