---
schema_version: 2
title: Chief-of-staff workflow
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [projects/executive-assistant/README.md, concepts/executive-assistant-operating-model.md, patterns/assistant-task-routing.md, L2_facts/user-operating-profile.md, L2_facts/approved-information-sources.md]
supersedes: []
superseded-by:
tags: [chief-of-staff, executive-assistant, workflow]
---

# Chief-of-staff workflow

## Trigger

Use when the user asks for a chief of staff, executive assistant, onboarding, office hours, strategic review, daily briefing, weekly planning, what needs attention, follow-up planning, work-preference memory, approved-source intake, subagent dispatch, or cross-project coordination.

## Steps

1. Ground locally:
   - `./te wiki context "<task>"`
   - Fetch only pages that change the answer or plan.
2. Check operating memory and access:
   - Read [[L2_facts/user-operating-profile]] when preferences, priorities, communication style, or decision style could matter.
   - Read [[L2_facts/approved-information-sources]] before touching any external folder/doc source.
   - Read [[L2_facts/source-intake-queue]] when a source is requested but not yet verified.
   - If a source is not registered, use [[L3_sops/approved-source-intake]] before inspection.
3. Clarify intent:
   - Goal.
   - Success criteria.
   - Audience.
   - Deadline or cadence.
   - Constraints and explicit non-goals.
   - Priority, preference, decision, or follow-up check-in when the task asks the assistant to "listen" or remember.
4. Route:
   - Quick work -> [[patterns/assistant-task-routing]]
   - First-run setup -> [[L3_sops/chief-of-staff-onboarding]]
   - Idea shaping -> [[patterns/executive-office-hours]]
   - Plan review -> [[patterns/strategic-plan-review]]
   - Daily/weekly briefing -> [[patterns/daily-weekly-briefing]]
   - Briefing dry run -> [[patterns/first-briefing-dry-run]]
   - Preference or decision capture -> [[patterns/structured-check-ins]]
   - Source intake -> [[L3_sops/approved-source-intake]]
   - Bounded delegated extraction/research/review -> [[L3_sops/subagent-dispatch-for-chief-of-staff]]
   - Prompt generation -> [[L3_sops/generate-prompt-from-instruction]]
   - Proactive idea generation -> [[patterns/proactive-idea-generation]]
   - Incisive critique and pushback -> [[patterns/incisive-expert-communication]]
5. Apply decision gates:
   - Use [[concepts/user-sovereignty-and-decision-gates]] for scope, access, privacy, destructive, or user-challenge decisions.
6. Execute or plan:
   - In normal execution mode, implement and verify.
   - For plan requests, produce a decision-complete plan.
   - For daily/weekly briefings, use manual-command flow and approved sources only.
   - For subagents, keep final synthesis in the main agent and accept only compact result packets.
   - Surface useful ideas proactively when they are relevant, reversible, and tied to current priorities.
7. Preserve memory:
   - Write durable wiki memory only after verified work or user-confirmed decisions.
   - Store only work preferences, approved sources, explicit decisions, and reusable workflows.
   - Update `log.md` and pointers when pages change.

## Output Contracts

Briefing:

- Situation.
- Decisions needed.
- Priorities.
- Blockers.
- Recommended next actions.
- Risks.
- Follow-ups.
- Sources checked.

Plan:

- Summary.
- Key changes.
- Tests or acceptance checks.
- Assumptions.

Cross-project coordination:

- Approved folder and access level.
- Local instructions read.
- Git status.
- Changes or recommendations.
- Remaining risk.

Preference memory:

- Confirmed preference.
- Scope and expiry if any.
- Source/evidence.
- Where recorded.
- Follow-up.

Subagent packet:

- Outcome.
- Sources.
- Confidence.
- Verification.
- Risks.
- Follow-ups.

## Related

- [[projects/executive-assistant/README]]
- [[patterns/assistant-task-routing]]
- [[L3_sops/chief-of-staff-onboarding]]
- [[patterns/daily-weekly-briefing]]
- [[patterns/first-briefing-dry-run]]
- [[patterns/structured-check-ins]]
- [[patterns/proactive-idea-generation]]
- [[patterns/incisive-expert-communication]]
- [[L3_sops/approved-source-intake]]
- [[L3_sops/subagent-dispatch-for-chief-of-staff]]
- [[L2_facts/user-operating-profile]]
- [[L2_facts/approved-information-sources]]
- [[L2_facts/source-intake-queue]]
- [[skills/executive-assistant/SKILL]]
