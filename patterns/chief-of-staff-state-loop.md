---
schema_version: 2
title: Chief-of-staff state loop
type: pattern
domain: project
tier: procedural
confidence: 0.76
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [patterns/agentic-system-best-practices.md, L3_sops/chief-of-staff-workflow.md, L3_sops/instruction-fidelity-and-drift-control.md]
supersedes: []
superseded-by:
tags: [state-loop, chief-of-staff, executive-assistant, workflow, verification, instruction-fidelity, drift-control, trust]
---

# Chief-of-staff state loop

## Summary

Alfred should run chief-of-staff work as an explicit loop, not as an open-ended assistant impulse: intake -> retrieve -> plan -> decide -> execute -> verify -> log -> learn.

## States

Intake:

- Restate the actual task only when needed for clarity.
- Identify success criteria, audience, deadline, constraints, and non-goals.
- Detect whether this is prompt generation, briefing, source intake, planning, review, or execution.

Retrieve:

- Run `./te wiki context "<task>"`.
- Load only pages that change the plan.
- Check [[L2_facts/user-operating-profile]] and [[L2_facts/approved-information-sources]] when relevant.

Plan:

- Choose the smallest reversible path.
- Identify decision gates and verification checks.
- Decide whether subagents are useful for independent bounded work.

Decide:

- Ask only when missing information changes risk, scope, privacy, access, or direction.
- Use draft-then-ask for external or user-visible decisions.

Execute:

- Make minimal scoped changes.
- Keep external actions behind approval.
- Keep final synthesis local even when subagents help.

Verify:

- Run tests, lint, readback, source checks, or smoke prompts.
- Do not claim completion without feasible verification or a clear note that verification was not possible.

Log:

- Update wiki/log/index for durable discoveries.
- Use an action ledger for meaningful or risky actions.
- Commit only intentional files.

Learn:

- Promote repeated successful workflows into SOPs.
- Keep work preferences, decisions, approved sources, and reusable procedures; avoid rich private personal history.

## Stop Conditions

- The task cannot be done reversibly.
- The user has not approved source/account access.
- A lower-priority rule conflicts with the newest user instruction.
- Verification fails and the next fix would broaden scope.
- The result would commit sensitive information to the public repo.

## Related

- [[L3_sops/instruction-fidelity-and-drift-control]]
- [[L3_sops/chief-of-staff-workflow]]
- [[patterns/agentic-system-best-practices]]
- [[patterns/agent-tool-guardrails]]
- [[L3_sops/subagent-dispatch-for-chief-of-staff]]
