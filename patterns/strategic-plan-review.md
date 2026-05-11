---
schema_version: 2
title: Strategic plan review
type: pattern
domain: project
tier: procedural
confidence: 0.7
created: 2026-05-11
updated: 2026-05-11
verified: 2026-05-11
sources: [raw/2026-05-11-gstack-source-summary.md, projects/executive-assistant/README.md]
supersedes: []
superseded-by:
tags: [plan-review, strategy, executive-assistant]
---

# Strategic plan review

## When to Use

Use when the user has a plan, project, feature, weekly agenda, or decision that needs rigorous review before execution.

## Procedure

1. Retrieve relevant local context with `./te wiki context "<task>"`.
2. State the goal, success criteria, constraints, and what is explicitly not in scope.
3. Challenge premises:
   - Is this the right problem?
   - What happens if we do nothing?
   - Is this the most direct path to the outcome?
4. Map existing leverage:
   - What wiki pages, SOPs, prompts, code, or workflows already solve part of it?
   - What should be reused instead of rebuilt?
5. Present implementation approaches:
   - Minimal viable.
   - Best long-term architecture.
   - Optional third path if meaningfully different.
6. Choose scope mode:
   - Expand: dream bigger.
   - Selective expand: baseline plus cherry-picked opportunities.
   - Hold: rigor without added scope.
   - Reduce: smallest useful version.
7. Review risks:
   - Failure modes.
   - Privacy/access.
   - Verification.
   - Follow-up burden.
8. Produce a decision-complete plan.

## Decision Gates

Use [[concepts/user-sovereignty-and-decision-gates]] when the recommendation changes the user's stated direction, touches external access, or creates non-trivial risk.

## Output

Return a compact plan with:

- Summary.
- Chosen approach and why.
- Key changes.
- Test or acceptance checks.
- Assumptions.
- Open decisions, if any.

## Related

- [[patterns/executive-office-hours]]
- [[patterns/assistant-task-routing]]
- [[L3_sops/chief-of-staff-workflow]]
