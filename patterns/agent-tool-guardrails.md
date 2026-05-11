---
schema_version: 2
title: Agent tool guardrails
type: pattern
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-additional-chief-of-staff-research.md, concepts/user-sovereignty-and-decision-gates.md, L3_sops/gogcli-workspace-access.md]
supersedes: []
superseded-by:
tags: [guardrails, tools, source-access, executive-assistant]
---

# Agent tool guardrails

## Summary

Every tool that can touch external accounts, external folders, or irreversible state needs a local guardrail before it becomes part of chief-of-staff execution.

## Guardrail Layers

1. Source registry: the tool may only read approved sources in [[L2_facts/approved-information-sources]].
2. Command policy: prefer allowlists over denylists for account-backed tools.
3. Dry run: use `--dry-run`, `--no-input`, or equivalent before mutation when available.
4. Draft-then-ask: prepare recommendations or drafts; ask before sends, deletes, shares, scheduling, or external writes.
5. Verification: run a non-mutating command after setup and before promotion.
6. Audit: log what source, command, and scope were used.

## Google Workspace Defaults

For `gog`:

- Use `--gmail-no-send` by default.
- Use `--readonly` during first auth where supported.
- Use narrow `--services`.
- Use `--enable-commands`/`--disable-commands` for runtime command narrowing.
- Prefer a baked `readonly` or `agent-safe` safety-profile binary before routine subagent use.

## Delegation Rule

Subagents may collect, extract, or review through guarded tools only when the main agent provides:

- source
- allowed commands or service surface
- forbidden actions
- result contract
- verification requirement

Final synthesis and any external action remain with the main agent.

## Related

- [[concepts/user-sovereignty-and-decision-gates]]
- [[L3_sops/gogcli-workspace-access]]
- [[L3_sops/subagent-dispatch-for-chief-of-staff]]
- [[raw/2026-05-11-additional-chief-of-staff-research]]
