---
schema_version: 2
title: gstack depth and agent repo refresh
type: source-summary
domain: tools
tier: episodic
confidence: 0.75
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [https://github.com/garrytan/gstack, https://api.github.com/repos/garrytan/gstack, https://github.com/openclaw/openclaw, https://github.com/n8n-io/n8n, https://github.com/ollama/ollama, https://github.com/langgenius/dify, https://github.com/open-webui/open-webui, https://github.com/langchain-ai/langchain, https://github.com/browser-use/browser-use, https://github.com/OpenHands/OpenHands, https://github.com/mem0ai/mem0, https://github.com/openai/openai-cookbook, https://arxiv.org/abs/2412.13459]
supersedes: []
superseded-by:
tags: [source-summary, gstack, agent-workflows, best-practices, executive-assistant]
---

# gstack depth and agent repo refresh

## Verification

- Date: 2026-05-11.
- Method: GitHub API metadata, web search, and a disposable shallow clone of `garrytan/gstack` into `/tmp/alfred-gstack-review`.
- No install, no vendoring, no runtime dependency, no home-directory configuration.

## gstack Depth

Earlier repo note depth: README plus GitHub API metadata. Useful but shallow.

This refresh inspected:

- Top-level repo structure, docs, workflows, and skill list.
- `README.md`, `ETHOS.md`, top-level `SKILL.md`.
- Selected skills: `office-hours`, `plan-ceo-review`, `review`, and `learn`.
- Skill headings and generated workflow structure through `rg`.

Current GitHub API snapshot:

- `garrytan/gstack`: 93,792 stars, 13,860 forks, 448 open issues, MIT, TypeScript, pushed 2026-05-11T19:49:32Z.

## gstack Useful Patterns

- Workflow chain: think -> plan -> build -> review -> test -> ship -> reflect.
- Office-hours forcing questions: demand reality, status quo, desperate specificity, narrowest wedge, observation/surprise, future-fit.
- CEO review modes: expansion, selective expansion, hold scope, scope reduction.
- Plan review should include: existing-code leverage, alternatives, error/rescue map, failure modes, security, tests, observability, rollout, long-term trajectory, and unresolved decisions.
- Review should cross-check plan intent against diff, classify findings as auto-fix or ask, calibrate confidence, and use adversarial/specialist review for larger changes.
- Learning memory should distinguish patterns, pitfalls, preferences, and architecture notes.
- Search-before-building is a strong default when the task involves unfamiliar runtime, current ecosystem, or tool choices.

## gstack Rejected Patterns

- Global install into `~/.claude` or other home-directory agent paths.
- Long generated preambles copied wholesale into this repo.
- Telemetry prompts and analytics state.
- Auto-update checks inside every skill invocation.
- Continuous checkpoint auto-commits.
- Team-mode repo mutation.
- Browser daemon/cookie import as default behavior.

## Higher-Signal Adjacent Repos

Popularity is not quality. Stars are a discovery signal only; star inflation and fake-star campaigns are a documented risk in the GitHub ecosystem.

GitHub API snapshots from 2026-05-11:

| Repo | Stars | Forks | Fit for Alfred |
|---|---:|---:|---|
| `openclaw/openclaw` | 370,907 | 76,675 | Learn account-action boundaries, local assistant architecture, and what not to do without strong guardrails. Treat as security-risk evidence, not an install target. |
| `n8n-io/n8n` | 187,464 | 57,543 | Learn workflow automation concepts: trigger/action separation, credentials isolation, dry runs, approval gates, execution logs. |
| `ollama/ollama` | 171,210 | 16,070 | Learn local-first packaging and model availability patterns if local inference becomes a V2 goal. |
| `langgenius/dify` | 140,970 | 22,130 | Learn app/agent workflow templates, RAG pipeline structure, and plugin boundaries. Avoid platform complexity in V1. |
| `open-webui/open-webui` | 136,621 | 19,457 | Learn self-hosted assistant UX and offline/local modes. Avoid adopting broad web-app surface before source access/memory workflows prove useful. |
| `langchain-ai/langchain` | 136,443 | 22,554 | Learn agent abstractions and production docs. Prefer ideas over dependency adoption. |
| `browser-use/browser-use` | 93,419 | 10,569 | Learn browser-action traces, screenshot-backed verification, and task observability. Codex Browser already covers much of the runtime need. |
| `OpenHands/OpenHands` | 73,187 | 9,257 | Learn coding-agent workspace boundaries, task execution modes, and human review loops. |
| `openai/openai-cookbook` | 73,443 | 12,401 | Learn current OpenAI prompting/API recipes and eval examples from official material. |
| `cline/cline` | 61,632 | 6,398 | Learn IDE coding-agent permission patterns and explicit tool approval UX. |
| `mem0ai/mem0` | 55,418 | 6,287 | Learn memory APIs and memory evaluation concepts. Keep Alfred memory repo-local and provenance-backed. |
| `crewAIInc/crewAI` | 51,176 | 7,074 | Learn role/task/process vocabulary for multi-agent dispatch; avoid autonomous role-play without bounded contracts. |
| `run-llama/llama_index` | 49,339 | 7,391 | Learn document-agent/RAG ingestion patterns if approved sources grow. |
| `BerriAI/litellm` | 46,561 | 7,953 | Learn provider abstraction, cost tracking, and routing patterns if model-routing becomes necessary. |
| `Aider-AI/aider` | 44,660 | 4,393 | Learn terminal coding-agent edit/test loop and git-aware workflows. |
| `anthropics/claude-cookbooks` | 42,729 | 4,804 | Learn official Claude recipes and prompt/tool-use patterns. |
| `khoj-ai/khoj` | 34,502 | 2,195 | Learn second-brain, scheduling, and document assistant patterns. Keep daemon/account access out of Alfred V1. |
| `continuedev/continue` | 33,117 | 4,493 | Learn source-controlled AI checks and CI-enforced rules. |
| `langchain-ai/langgraph` | 31,781 | 5,394 | Learn durable agent state, checkpoints, human-in-the-loop, and explicit workflow graphs. |
| `getzep/graphiti` | 25,918 | 2,575 | Learn temporal knowledge graph patterns for memory provenance and contradiction handling. |
| `microsoft/promptflow` | 11,123 | 1,104 | Learn prompt/app evaluation, regression datasets, and monitoring discipline. |

## Adoption Rationale

Near-term adoption should be methodology, not dependency:

- Add a best-practices pattern for evaluating agent repos and extracting useful methods.
- Add an instruction-fidelity/drift-control workflow before heavier assistant automation.
- Add a state-machine pattern for chief-of-staff work: intake -> plan -> execute -> verify -> log -> learn.
- Add stronger action-ledger and reversibility language to chief-of-staff workflows before account-backed tools are promoted.

## Related

- [[raw/2026-05-11-gstack-source-summary]]
- [[raw/2026-05-11-executive-assistant-landscape]]
- [[patterns/agentic-system-best-practices]]
- [[patterns/agent-tool-guardrails]]
- [[L3_sops/external-source-adoption]]
