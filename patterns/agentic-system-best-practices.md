---
schema_version: 2
title: Agentic system best practices
type: pattern
domain: project
tier: semantic
confidence: 0.75
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-gstack-depth-and-agent-repo-refresh.md, patterns/agent-tool-guardrails.md, concepts/user-sovereignty-and-decision-gates.md]
supersedes: []
superseded-by:
tags: [agents, best-practices, executive-assistant, research, adoption]
---

# Agentic system best practices

## Summary

Use popular agent repos as a scouting layer, not as authority. Alfred should extract methods, test them locally, and adopt only reversible, provenance-backed practices that improve the chief-of-staff loop.

## Evaluation Signals

For any repo, tool, skill, framework, or platform under consideration, record:

- URL.
- Date verified.
- Stars, forks, open issues, pushed date, license, and maintainer/org.
- Primary use case.
- Useful method to learn.
- Rejected method or risk.
- Fit for Alfred: adopt, adapt, test, monitor, defer, or reject.
- Reversibility and undo path.
- Verification command or source.

Do not equate stars with quality. Popularity means "inspect this," not "trust this."

## Practices To Adopt

- Explicit workflow states: intake, plan, execute, verify, log, learn.
- Human approval gates for source access, external writes, sends, deletes, installs, scheduling, sharing, and public/private boundary changes.
- Tool observability: every tool action should leave source, command, scope, output summary, and risk.
- Memory with provenance: facts need source, date, confidence, scope, and update path.
- Compact subagent packets: outcome, sources, confidence, verification, risks, follow-ups.
- Evaluation harnesses: smoke prompts, retrieval checks, broken-link lint, tests, and regression examples.
- Search-before-building: check current best practices before adding unfamiliar runtime/tooling.
- Action reversibility: prefer drafts, dry runs, branchable edits, and small commits over hidden mutation.

## Practices To Reject By Default

- Global installs or home-directory agent configuration as a first move.
- Always-on daemons before a manual workflow proves useful.
- Broad folder scans without explicit source approval.
- Credential import, cookie import, email send, calendar mutation, or account action without a decision gate.
- Telemetry or auto-update behavior inside Alfred workflows.
- Long universal preambles that drown task-specific instructions.
- Autonomous role-play without bounded ownership, result contracts, and verification.

## Alfred Application

When researching a new agentic repo, return:

- Strongest reason not to adopt it.
- Strongest reason to learn from it.
- Specific Alfred change proposed.
- Reversibility.
- Confidence.
- Source links.

Promote a method only after:

- It improves a real user workflow.
- It is documented in the wiki.
- It passes relevant retrieval/lint/test checks.
- It does not weaken user sovereignty or source-access boundaries.

## Related

- [[raw/2026-05-11-gstack-depth-and-agent-repo-refresh]]
- [[patterns/agent-tool-guardrails]]
- [[concepts/user-sovereignty-and-decision-gates]]
- [[L3_sops/chief-of-staff-evaluation]]
- [[L3_sops/external-source-adoption]]
