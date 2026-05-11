---
schema_version: 2
title: Assistant task routing
type: pattern
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [projects/executive-assistant/README.md, skills/personal-assistant/SKILL.md, raw/2026-05-11-executive-assistant-landscape.md, L2_facts/user-operating-profile.md, L2_facts/approved-information-sources.md]
supersedes: []
superseded-by:
tags: [routing, executive-assistant, personal-assistant]
---

# Assistant task routing

## Summary

Route each request to the smallest workflow that can complete it safely.

## Routing Table

| User intent | Route |
|---|---|
| `/pa` or `/btw`, quick answer, light formatting | `./te pa --directive "<prompt>"` |
| First-run setup, tune the assistant, or set it all up | [[L3_sops/chief-of-staff-onboarding]] |
| Prompt generation | [[L3_sops/generate-prompt-from-instruction]] |
| Idea, strategy, prioritization, weekly planning | [[patterns/executive-office-hours]] |
| Existing plan needs review | [[patterns/strategic-plan-review]] |
| Daily briefing, weekly planning, or what needs attention | [[patterns/daily-weekly-briefing]] |
| Dry-run daily/weekly/attention briefing | [[patterns/first-briefing-dry-run]] |
| Remember a work preference or capture a decision | [[patterns/structured-check-ins]], then update [[L2_facts/user-operating-profile]] only after confirmation |
| Add a folder/source or tap into docs | [[L3_sops/approved-source-intake]], update [[L2_facts/source-intake-queue]] if pending, then update [[L2_facts/approved-information-sources]] after verification |
| Connect Google Workspace through gog | [[L3_sops/gogcli-workspace-access]] |
| Launch subagents for briefing/research/review | [[L3_sops/subagent-dispatch-for-chief-of-staff]] |
| Cross-project work | Confirm exact folder is listed in [[L2_facts/approved-information-sources]], then read that folder's instructions and git state |
| Durable documentation | [[skills/wiki-write/SKILL]] |
| Context refresh or resume | [[skills/context-refresh/SKILL]] |
| Complex implementation | Use local project instructions, inspect reality, implement, verify |

## Rules

- Retrieve before relying on project memory.
- Do not load whole wiki pages when compact search is enough.
- Do not inspect external folders unless they are explicitly approved in [[L2_facts/approved-information-sources]] or the current turn grants named access.
- Store work preferences only in [[L2_facts/user-operating-profile]] after user confirmation.
- Treat [[L2_facts/source-intake-queue]] as pending access, not approval to read.
- Do not turn source research into durable fact until the source has been verified.
- Keep account connectors, broad local scans, and recurring automations out of V1 unless separately approved.
- Use draft-then-ask mode for external effects or decisions.
- Use subagents only for independent bounded work when the user has authorized delegation.

## Related

- [[concepts/executive-assistant-operating-model]]
- [[L3_sops/chief-of-staff-workflow]]
- [[L3_sops/chief-of-staff-onboarding]]
- [[patterns/daily-weekly-briefing]]
- [[patterns/first-briefing-dry-run]]
- [[patterns/structured-check-ins]]
- [[L3_sops/approved-source-intake]]
- [[L3_sops/gogcli-workspace-access]]
- [[L3_sops/subagent-dispatch-for-chief-of-staff]]
- [[projects/executive-assistant/README]]
