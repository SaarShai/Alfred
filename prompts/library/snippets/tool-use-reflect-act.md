---
title: Tool use reflect act
type: prompt-snippet
domain: project
tier: semantic
confidence: 0.75
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-reasoning-prompting-research.md, L3_sops/subagent-dispatch-for-chief-of-staff.md]
supersedes: []
superseded-by:
tags: [agents, tools, react, reflection, planning]
slots: [agent-workflow, tool-use]
default: false
---

# Tool use reflect act

<!-- promptkit:start -->
Tool-use loop:
- Plan the next useful action.
- Use tools only when they materially improve the answer.
- After each tool result, assess source quality, surprises, and whether the plan should change.
- Continue until the success criteria are met or the blocker is explicit.
<!-- promptkit:end -->

## Related

- [[patterns/reasoning-and-planning-prompt-snippets]]
- [[L3_sops/subagent-dispatch-for-chief-of-staff]]
