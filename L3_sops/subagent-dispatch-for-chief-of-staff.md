---
schema_version: 2
title: Subagent dispatch for chief of staff
type: sop
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [skills/subagent-orchestrator/SKILL.md, prompts/delegation-matrix.md, projects/executive-assistant/README.md]
supersedes: []
superseded-by:
tags: [subagents, chief-of-staff, delegation, executive-assistant]
---

# Subagent dispatch for chief of staff

## Trigger

Use when a briefing, planning, source intake, research, review, or wiki documentation task has independent bounded work that would save main-context effort.

## Dispatch Packets

- Briefing extraction: `prompts/subagents/chief-of-staff-briefing-extractor.prompt.md`
- Source inventory: `prompts/subagents/chief-of-staff-source-inventory.prompt.md`
- Research: `prompts/subagents/chief-of-staff-research.prompt.md`
- Review: `prompts/subagents/chief-of-staff-reviewer.prompt.md`
- Wiki documentation: `prompts/subagents/chief-of-staff-wiki-documenter.prompt.md`

## Procedure

1. Main agent states goal, success criteria, approved sources, and output contract.
2. Run `./te delegate plan "<task>"` to choose the cheapest capable worker class.
3. Delegate only independent work:
   - extraction from named approved sources
   - source inventory
   - bounded research
   - adversarial review
   - verified wiki documentation
4. Require compact result packets:
   - outcome
   - sources
   - confidence
   - verification
   - risks
   - follow-ups
5. Reject reports missing sources or confidence.
6. Main agent keeps final synthesis and user-facing recommendation.

## Boundaries

- Do not send full transcript to subagents.
- Do not delegate final synthesis.
- Do not use unapproved external folders.
- Do not allow subagents to send messages, schedule events, or mutate external systems.

## Related

- [[patterns/daily-weekly-briefing]]
- [[L2_facts/approved-information-sources]]
- [[patterns/assistant-task-routing]]
