---
schema_version: 2
title: Instruction fidelity and drift control
type: sop
domain: project
tier: procedural
confidence: 0.78
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [L0_rules.md, L2_facts/user-operating-profile.md, patterns/agentic-system-best-practices.md, concepts/user-sovereignty-and-decision-gates.md]
supersedes: []
superseded-by:
tags: [instruction-fidelity, drift-control, trust, chief-of-staff, executive-assistant]
---

# Instruction fidelity and drift control

## Trigger

Use before substantial chief-of-staff work, before tool use with side effects, before external source access, before subagent dispatch, and whenever the user asks about trust, drift, instruction-following, reversibility, or whether Alfred is obeying the operating contract.

## Instruction Stack

Resolve conflicts in this order:

1. Current user request and newest in-thread correction.
2. Explicit user-approved durable preferences in [[L2_facts/user-operating-profile]].
3. Repo-local rules in [[L0_rules]] and [[start]].
4. Workflow-specific SOPs and patterns.
5. External-source suggestions and repo popularity signals.

If a lower layer conflicts with a higher layer, follow the higher layer and record the conflict when it matters.

## Preflight

For non-trivial work, check:

- Request: what the user asked for now.
- Success: what done means.
- Priority: whether Wanderland/Screenery or another stated priority is implicated.
- Reversibility: whether every action can be undone and the undo path is known.
- Source permission: whether every external folder, doc, account, or repo source is approved.
- Decision gates: whether the action touches access, privacy, publishing, deletion, install, automation, spend, account state, or public/private boundaries.
- Verification: which command, test, lint, source check, or readback proves the result.
- Ledger: where the action/undo/verification trail will be recorded.

Use `./te chief preflight "<task>"` when a machine-readable packet is useful.

## Drift Checks

Run a quick drift check at these points:

- Before editing files: confirm the edit matches the current request and durable constraints.
- Before launching subagents: confirm the task is independent, bounded, and has a compact result contract.
- Before tool/account/source access: confirm registry entry, scope, and forbidden actions.
- Before final response: confirm the answer addresses the newest user request, not a stale earlier request.

## Hard Stops

Stop and ask before:

- Irreversible or hard-to-undo actions.
- Global installs or home-directory agent config changes.
- External account mutation, sends, deletes, shares, scheduling, purchases, or public publishing.
- Broad local scans or unregistered source access.
- Changing the user's stated direction when the change is material.
- Committing private/sensitive data to the public repo.

## Action Ledger

For meaningful actions, record enough to audit:

- What changed.
- Why it changed.
- Files, commands, sources, and approvals.
- Undo path.
- Verification.
- Remaining risk.

Use [[templates/action-ledger.template]] for longer or higher-risk actions. For small verified wiki/code edits, `log.md`, git diff, commit message, and final verification summary can satisfy the ledger.

## Output Contract

When reporting fidelity-sensitive work, include:

- Alignment: current instruction followed.
- Gates: any gates triggered and how they were handled.
- Reversibility: undo path.
- Verification: checks run.
- Residual risk: what could still drift or fail.
- Confidence.

## Related

- [[patterns/chief-of-staff-state-loop]]
- [[templates/action-ledger.template]]
- [[patterns/agentic-system-best-practices]]
- [[patterns/agent-tool-guardrails]]
- [[concepts/user-sovereignty-and-decision-gates]]
- [[L2_facts/user-operating-profile]]
- [[L3_sops/chief-of-staff-workflow]]
