---
schema_version: 2
title: additional chief-of-staff research source summary
type: source-summary
domain: external-source
tier: episodic
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [https://gogcli.sh, https://gogcli.sh/safety-profiles.html, https://docs.letta.com/guides/core-concepts/stateful-agents, https://docs.letta.com/guides/core-concepts/memory/context-hierarchy, https://docs.mem0.ai/platform/features/entity-scoped-memory, https://github.com/getzep/graphiti, https://modelcontextprotocol.io/docs/getting-started/intro, https://github.com/modelcontextprotocol/servers, https://developers.openai.com/api/docs/guides/agents, https://openai.github.io/openai-agents-python/guardrails/]
supersedes: []
superseded-by:
tags: [source-summary, executive-assistant, memory, guardrails, mcp, evaluation]
---

# additional chief-of-staff research source summary

## Verified GitHub Metrics

GitHub API checked on 2026-05-11.

| Repo | Stars | Forks | License | Language | Pushed | Useful signal |
|---|---:|---:|---|---|---|---|
| https://github.com/openclaw/gogcli | 7,345 | 566 | MIT | Go | 2026-05-11 | Google Workspace CLI with agent safety flags and safety-profile binaries |
| https://github.com/mem0ai/mem0 | 55,403 | 6,281 | Apache-2.0 | Python | 2026-05-09 | Entity-scoped memory, categories, audit/export patterns |
| https://github.com/letta-ai/letta | 22,637 | 2,400 | Apache-2.0 | Python | 2026-04-12 | Stateful agents, memory blocks, context hierarchy |
| https://github.com/getzep/graphiti | 25,913 | 2,573 | Apache-2.0 | Python | 2026-05-08 | Temporal graph memory, provenance, validity windows |
| https://github.com/modelcontextprotocol/servers | 85,444 | 10,658 | NOASSERTION | TypeScript | 2026-04-17 | MCP reference servers and connector pattern |
| https://github.com/openai/openai-agents-python | 26,186 | 4,016 | MIT | Python | 2026-05-11 | Code-first agent orchestration, guardrails, handoffs, evaluation path |
| https://github.com/browser-use/browser-use | 93,389 | 10,570 | MIT | Python | 2026-05-11 | Browser automation pattern; too broad for V1 unless a task needs web UI control |
| https://github.com/langchain-ai/langgraph | 31,762 | 5,391 | MIT | Python | 2026-05-10 | Resilient agent graph pattern; useful as evidence, not dependency |

## Useful Patterns To Adopt

- `gog` safety profiles: use runtime `--gmail-no-send`, `--readonly`, `--enable-commands`, and `--disable-commands` now; build a baked read-only or agent-safe binary later if `gog` becomes a routine subagent tool.
- Mem0/OpenMemory: keep memory scoped by user, agent, app/source, and run; keep auditability and cleanup paths.
- Letta: separate always-loaded memory blocks from file-level context and archival memory; do not stuff everything into a single profile.
- Graphiti/Zep: record temporal validity, provenance, and supersession for changing facts.
- MCP: treat connectors as explicit source adapters with security review; do not install reference/community servers casually.
- OpenAI Agents SDK: use tool guardrails for each tool call in delegated workflows, and add evaluation loops before new assistant capabilities graduate.

## Rejected For V1

- Installing Mem0/OpenMemory, Letta, Zep/Graphiti, MCP servers, LangGraph, or browser-use as new runtime dependencies.
- Broad always-on local scans or daemonized memory.
- Marketplace connector installs without source-specific approval.
- Browser automation as a default way to access accounts.

## Local Adoption

- Add [[concepts/memory-scoping-and-context-hierarchy]].
- Add [[patterns/agent-tool-guardrails]].
- Add [[L3_sops/chief-of-staff-evaluation]].
- Update [[L3_sops/gogcli-workspace-access]] with a safety-profile future step.
- Keep Google Workspace in [[L2_facts/source-intake-queue]] until OAuth and non-mutating verification complete.

## Related

- [[raw/2026-05-11-gogcli-install-source]]
- [[projects/executive-assistant/README]]
- [[L3_sops/external-source-adoption]]
