---
schema_version: 2
title: executive assistant landscape source summary
type: source-summary
domain: tools
tier: episodic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [https://github.com/openclaw/openclaw, https://github.com/affaan-m/everything-claude-code, https://github.com/forrestchang/andrej-karpathy-skills, https://github.com/khoj-ai/khoj, https://github.com/safishamsi/graphify, https://github.com/browser-use/browser-use, https://github.com/langchain-ai/langgraph, https://github.com/microsoft/autogen, https://github.com/crewAIInc/crewAI]
supersedes: []
superseded-by:
tags: [source-summary, executive-assistant, agents, memory, orchestration]
---

# executive assistant landscape source summary

## Source

GitHub API metadata and selected README passages were inspected on 2026-05-11.

| Repository | Stars | Forks | Language | License | Adopt | Reject |
|---|---:|---:|---|---|---|---|
| https://github.com/openclaw/openclaw | 370,787 | 76,631 | TypeScript | MIT | Local-first assistant posture, channel safety, explicit pairing and sandbox boundaries | Always-on gateway, messaging channels, remote access |
| https://github.com/affaan-m/everything-claude-code | 179,143 | 27,618 | JavaScript | MIT | Harness optimization, research-first workflows, memory/security emphasis | Large cross-harness install surface |
| https://github.com/forrestchang/andrej-karpathy-skills | 124,761 | 12,678 | none | NOASSERTION | Think before coding, simplicity, surgical changes, goal-driven execution | Single global CLAUDE.md as source of truth |
| https://github.com/browser-use/browser-use | 93,384 | 10,569 | Python | MIT | Browser automation as optional future capability | New browser dependency in this repo |
| https://github.com/microsoft/autogen | 57,923 | 8,737 | Python | CC-BY-4.0 | Explicit multi-agent design vocabulary | Heavy framework/runtime dependency |
| https://github.com/crewAIInc/crewAI | 51,156 | 7,069 | Python | MIT | Role-based agent collaboration vocabulary | Autonomous crew runtime |
| https://github.com/safishamsi/graphify | 46,469 | 5,037 | Python | MIT | Queryable knowledge graph, source confidence tags, wiki output | Installing graph pipeline before corpus need is proven |
| https://github.com/khoj-ai/khoj | 34,498 | 2,195 | Python | AGPL-3.0 | Second-brain positioning, document/web answers, automations as future direction | Self-host app and AGPL runtime dependency |
| https://github.com/langchain-ai/langgraph | 31,754 | 5,390 | Python | MIT | Durable workflow/agent graph concepts | Framework adoption before a runtime need exists |

## Claims

- Popular assistant projects cluster around four capabilities: memory, routing, tool/channel access, and recurring workflows.
- For this repo, memory and routing are already native Token Economy concepts; tool/channel access should stay out of scope until explicitly requested.
- Graphify's useful lesson is not "install a graph database"; it is source-grounded compression with confidence labels.
- OpenClaw's useful lesson is that real personal assistants need security and pairing defaults before they touch inbound channels.
- Karpathy-style rules are already aligned with Token Economy: state assumptions, keep changes surgical, and verify against goals.

## Takeaways

- Build the chief-of-staff workspace as a repo-local operating system for thought, planning, retrieval, and documentation.
- Keep external account access, messaging channels, calendar/email integrations, and daemons as future optional capabilities.
- Prefer explicit workflows over autonomous multi-agent runtimes until the project has a repeated task that justifies code.

## Adoption

- Added as evidence for [[concepts/executive-assistant-operating-model]], [[patterns/assistant-task-routing]], and [[L3_sops/chief-of-staff-workflow]].
- No external repository is installed, vendored, or made a runtime dependency.

## Related

- [[raw/2026-05-11-gstack-source-summary]]
- [[L3_sops/external-source-adoption]]
- [[index]]
